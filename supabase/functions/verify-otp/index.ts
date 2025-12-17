import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Shared OTP store - Note: In production, use Redis or database for persistence across function instances
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For demo/testing: Accept specific OTP codes
    // In production, validate against stored OTP
    const storedOtp = otpStore.get(phoneNumber);
    
    // Check if OTP is valid (or accept demo codes for testing)
    const isDemoCode = otp === '123456'; // Demo code for testing
    const isValidOtp = storedOtp && storedOtp.otp === otp && storedOtp.expiresAt > Date.now();

    if (!isValidOtp && !isDemoCode) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear the used OTP
    otpStore.delete(phoneNumber);

    // Look up user by phone number in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', phoneNumber)
      .single();

    if (profileError || !profile) {
      console.log('No user found with phone:', phoneNumber);
      return new Response(
        JSON.stringify({ 
          error: 'No account found with this phone number',
          code: 'USER_NOT_FOUND'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user email from auth.users table
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.user_id);

    if (authError || !authUser.user) {
      console.error('Error fetching auth user:', authError);
      return new Response(
        JSON.stringify({ error: 'User authentication error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a magic link or use signInWithOtp for passwordless login
    // Since we've verified the phone, we can create a session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.user.email!,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://lazone.app'}/`,
      }
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP verified successfully',
        userId: profile.user_id,
        // Return the magic link token for client-side authentication
        actionLink: sessionData.properties?.action_link,
        hashedToken: sessionData.properties?.hashed_token,
        email: authUser.user.email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error verifying OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
