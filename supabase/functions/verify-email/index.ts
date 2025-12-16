import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyEmailRequest = await req.json();

    console.log(`Verifying email with token: ${token}`);

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Token manquant" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find profile with this token
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, user_id, email_verified, verification_token_expires_at")
      .eq("verification_token", token)
      .single();

    if (fetchError || !profile) {
      console.error("Token not found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Token invalide ou expiré" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token has expired
    if (new Date(profile.verification_token_expires_at) < new Date()) {
      console.log("Token expired");
      return new Response(
        JSON.stringify({ success: false, error: "Le lien de vérification a expiré. Veuillez demander un nouveau lien." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already verified
    if (profile.email_verified) {
      console.log("Email already verified");
      return new Response(
        JSON.stringify({ success: true, message: "Email déjà vérifié" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark as verified and clear token
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Erreur lors de la vérification");
    }

    console.log(`Email verified successfully for user ${profile.user_id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email vérifié avec succès" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
