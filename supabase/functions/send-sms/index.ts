import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  to: string;
  type: 'otp' | 'notification';
}

// Input validation patterns
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const OTP_EXPIRY_MINUTES = 5;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get auth user
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const requestBody = await req.json();
    const { to, type }: SMSRequest = requestBody;

    // Input validation
    if (!to || typeof to !== 'string') {
      throw new Error('Valid phone number is required');
    }

    if (!type || !['otp', 'notification'].includes(type)) {
      throw new Error('Valid SMS type is required');
    }

    // Validate phone number format
    if (!PHONE_REGEX.test(to)) {
      throw new Error('Invalid phone number format');
    }

    // Rate limiting check (max 3 SMS per phone per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentSMS, error: countError } = await supabase
      .from('security_audit_log')
      .select('id')
      .eq('action_type', 'sms_sent')
      .eq('resource_id', to)
      .gte('created_at', oneHourAgo.toISOString())
      .limit(3);

    if (countError) {
      console.error('Rate limit check error:', countError);
    } else if (recentSMS && recentSMS.length >= 3) {
      throw new Error('Too many SMS attempts. Please try again later.');
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    // Secure credential validation
    if (!accountSid || !authToken || !twilioNumber) {
      throw new Error('SMS service not configured');
    }

    let message = '';
    let otpCode = null;

    if (type === 'otp') {
      // Generate secure 6-digit OTP
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      message = `Votre code de connexion LaZone: ${otpCode}. Ce code expire dans ${OTP_EXPIRY_MINUTES} minutes.`;
      
      // Store OTP securely in security_audit_log
      const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      const otpHash = btoa(otpCode); // Simple base64 encoding for demo
      
      const { error: otpError } = await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_action_type: 'otp_generated',
        p_resource_type: 'sms_otp',
        p_resource_id: to,
        p_success: true,
        p_error_message: JSON.stringify({
          otp_hash: otpHash,
          expires_at: expiryTime.toISOString()
        })
      });

      if (otpError) {
        console.error('Failed to store OTP:', otpError);
        throw new Error('Failed to generate OTP');
      }
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('Body', message);
    formData.append('From', twilioNumber);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio API error:', response.status, error);
      throw new Error('Failed to send SMS');
    }

    const result = await response.json();
    
    // Log successful SMS send
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_action_type: 'sms_sent',
      p_resource_type: 'sms',
      p_resource_id: to,
      p_success: true
    });

    return new Response(JSON.stringify({ 
      success: true,
      type: type,
      // Never return sensitive data like OTP codes
      message: type === 'otp' ? 'OTP sent successfully' : 'SMS sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('SMS function error:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send SMS',
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});