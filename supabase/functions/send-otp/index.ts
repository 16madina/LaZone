import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5 minute expiration
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(phoneNumber, { otp, expiresAt });

    // Clean up expired OTPs
    for (const [key, value] of otpStore.entries()) {
      if (value.expiresAt < Date.now()) {
        otpStore.delete(key);
      }
    }

    const apiKey = (Deno.env.get('AFRICASTALKING_API_KEY') ?? '').trim();
    const username = (Deno.env.get('AFRICASTALKING_USERNAME') ?? '').trim();

    const isSandbox = (username || '').toLowerCase() === 'sandbox';
    console.log("Africa's Talking config:", {
      username,
      isSandbox,
      apiKeyLength: apiKey.length,
    });

    if (!apiKey || !username) {
      console.error("Africa's Talking credentials not configured");
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (ensure it has + prefix)
    const sanitizedPhone = String(phoneNumber).replace(/\s+/g, '');
    const formattedPhone = sanitizedPhone.startsWith('+') ? sanitizedPhone : `+${sanitizedPhone}`;

    // Africa's Talking uses a separate base URL for Sandbox
    const baseUrl = isSandbox ? 'https://api.sandbox.africastalking.com' : 'https://api.africastalking.com';
    // Send SMS via Africa's Talking API
    const smsResponse = await fetch(`${baseUrl}/version1/messaging`, {
      method: 'POST',
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: username,
        to: formattedPhone,
        message: `Votre code de vérification LaZone est: ${otp}. Ce code expire dans 5 minutes.`,
      }),
    });

    // Read response as text first to handle non-JSON errors
    const responseText = await smsResponse.text();
    console.log('Africa\'s Talking raw response:', responseText);
    console.log('Response status:', smsResponse.status);

    // Check if response is not OK (e.g., 401, 403, 500)
    if (!smsResponse.ok) {
      console.error('Africa\'s Talking API error:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'SMS service error', 
          details: responseText || `HTTP ${smsResponse.status}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse as JSON
    let smsResult;
    try {
      smsResult = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse Africa\'s Talking response as JSON:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from SMS service', 
          details: responseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Africa\'s Talking parsed response:', JSON.stringify(smsResult));

    if (smsResult.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorStatus = smsResult.SMSMessageData?.Recipients?.[0]?.status || 
                          smsResult.SMSMessageData?.Message || 
                          'Unknown error';
      console.error('SMS sending failed:', errorStatus);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send SMS', 
          details: errorStatus
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Error sending OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
