import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  firstName: string;
  verificationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, verificationUrl }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "LaZone <onboarding@resend.dev>",
      to: [email],
      subject: "Vérifiez votre compte LaZone",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🏠</div>
              <h1 style="color: #f97316; font-size: 28px; margin: 0;">LaZone</h1>
              <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Immobilier en Afrique</p>
            </div>
            
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Bonjour ${firstName} 👋</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Bienvenue sur LaZone ! Pour activer votre compte et accéder à toutes les fonctionnalités, 
              veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #f97316, #fb923c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Vérifier mon compte
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin-top: 32px;">
              Si vous n'avez pas créé de compte sur LaZone, vous pouvez ignorer cet email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} LaZone - Immobilier en Afrique
            </p>
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
