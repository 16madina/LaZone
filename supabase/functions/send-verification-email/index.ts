import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  firstName: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, userId }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to ${email} for user ${userId}`);

    // Get Supabase client to fetch/update verification token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate new verification token
    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Update profile with new token
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_token: newToken,
        verification_token_expires_at: expiresAt,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating verification token:", updateError);
      throw new Error("Failed to generate verification token");
    }

    // Build verification URL - use production URL for email links
    const productionUrl = "https://lazoneapp.com";
    const verificationUrl = `${productionUrl}/verify-email?token=${newToken}`;

    const emailResponse = await resend.emails.send({
      from: "LaZone <noreply@lazoneapp.com>",
      to: [email],
      subject: "Vérifiez votre compte LaZone",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%); padding: 40px 20px; margin: 0;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 24px; padding: 48px 40px; box-shadow: 0 20px 60px rgba(34, 197, 94, 0.15), 0 4px 20px rgba(0,0,0,0.05);">
            
            <!-- Logo Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <img src="https://lazoneapp.com/images/logo-lazone.png" alt="LaZone" style="width: 180px; height: auto; margin-bottom: 8px;">
              <p style="color: #16a34a; font-size: 14px; margin: 0; font-weight: 500; letter-spacing: 1px;">IMMOBILIER EN AFRIQUE</p>
            </div>
            
            <!-- Divider -->
            <div style="height: 3px; background: linear-gradient(90deg, transparent, #22c55e, transparent); margin-bottom: 32px; border-radius: 2px;"></div>
            
            <!-- Greeting -->
            <h2 style="color: #166534; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">Bonjour ${firstName} 👋</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.7; margin-bottom: 28px;">
              Bienvenue sur <strong style="color: #16a34a;">LaZone</strong> ! Pour activer votre compte et obtenir le 
              <span style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 2px 8px; border-radius: 6px; font-size: 14px;">badge vérifié</span>, 
              cliquez sur le bouton ci-dessous.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 36px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 14px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35); transition: all 0.3s ease;">
                ✓ Vérifier mon compte
              </a>
            </div>
            
            <!-- Info Box -->
            <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-radius: 12px; padding: 16px 20px; margin-top: 28px; border-left: 4px solid #22c55e;">
              <p style="color: #166534; font-size: 14px; line-height: 1.5; margin: 0;">
                <strong>⏰ Ce lien expire dans 24 heures.</strong><br>
                <span style="color: #6b7280;">Si vous n'avez pas créé de compte sur LaZone, ignorez cet email.</span>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} LaZone - Votre partenaire immobilier en Afrique
              </p>
              <p style="color: #d1d5db; font-size: 11px; margin-top: 8px;">
                Dakar • Abidjan • Lagos • Casablanca • Nairobi
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
