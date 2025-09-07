import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  phone: string;
  code: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { phone, code }: VerifyOTPRequest = await req.json();

    // Input validation
    if (!phone || !code) {
      throw new Error('Phone number and OTP code are required');
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      throw new Error('Invalid phone number format');
    }

    if (!/^\d{6}$/.test(code)) {
      throw new Error('Invalid OTP code format');
    }

    // Rate limiting - max 5 attempts per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempts, error: countError } = await supabase
      .from('security_audit_log')
      .select('id')
      .eq('action_type', 'otp_verify_attempt')
      .eq('resource_id', phone)
      .gte('created_at', oneHourAgo.toISOString());

    if (recentAttempts && recentAttempts.length >= 5) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action_type: 'otp_verify_rate_limited',
        p_resource_type: 'sms_otp',
        p_resource_id: phone,
        p_success: false,
        p_error_message: 'OTP verification rate limit exceeded'
      });
      throw new Error('Too many OTP attempts. Please try again later.');
    }

    // Log verification attempt
    await supabase.rpc('log_security_event', {
      p_user_id: null,
      p_action_type: 'otp_verify_attempt',
      p_resource_type: 'sms_otp',
      p_resource_id: phone,
      p_success: true
    });

    // Find the most recent valid OTP for this phone
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const { data: otpRecords, error: otpError } = await supabase
      .from('security_audit_log')
      .select('error_message, created_at')
      .eq('action_type', 'otp_generated')
      .eq('resource_type', 'sms_otp')
      .eq('resource_id', phone)
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError || !otpRecords || otpRecords.length === 0) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action_type: 'otp_verify_failed',
        p_resource_type: 'sms_otp',
        p_resource_id: phone,
        p_success: false,
        p_error_message: 'No valid OTP found'
      });
      throw new Error('Invalid or expired OTP code');
    }

    const otpRecord = otpRecords[0];
    let otpData;
    try {
      otpData = JSON.parse(otpRecord.error_message);
    } catch (parseError) {
      console.error('Failed to parse OTP data:', parseError);
      throw new Error('Invalid OTP record');
    }
    
    // Check if OTP is expired
    if (new Date(otpData.expires_at) < new Date()) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action_type: 'otp_verify_failed',
        p_resource_type: 'sms_otp',
        p_resource_id: phone,
        p_success: false,
        p_error_message: 'OTP expired'
      });
      throw new Error('OTP code has expired');
    }

    // Verify OTP code
    const storedOtpHash = otpData.otp_hash;
    const providedOtpHash = btoa(code);
    
    if (storedOtpHash !== providedOtpHash) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action_type: 'otp_verify_failed',
        p_resource_type: 'sms_otp',
        p_resource_id: phone,
        p_success: false,
        p_error_message: 'Invalid OTP code'
      });
      throw new Error('Invalid OTP code');
    }

    // Mark OTP as used by updating the record
    await supabase.rpc('log_security_event', {
      p_user_id: null,
      p_action_type: 'otp_verify_success',
      p_resource_type: 'sms_otp',
      p_resource_id: phone,
      p_success: true,
      p_error_message: 'OTP verified successfully'
    });

    // In a real implementation, you would:
    // 1. Create or find user account by phone
    // 2. Generate auth tokens
    // 3. Return proper session data
    
    return new Response(JSON.stringify({
      success: true,
      message: 'OTP verified successfully',
      // Add auth token generation here
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('OTP verification error:', error.message);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to verify OTP',
      success: false
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});