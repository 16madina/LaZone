import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 send-auth-email function called");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📥 Processing auth webhook request");
    const payload = await req.text();
    console.log("Payload received:", payload.length, "characters");
    console.log("RESEND_API_KEY available:", !!Deno.env.get('RESEND_API_KEY'));
    
    // Parse webhook payload directly (Supabase handles auth verification)
    const webhookData = JSON.parse(payload) as {
      user: { email: string };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };
    
    console.log("✅ Webhook payload parsed successfully");
    
    const { user, email_data: { token, token_hash, redirect_to, email_action_type } } = webhookData;

    console.log("Received auth webhook:", { email: user.email, email_action_type });

    const to = user.email;

    // Construct the confirmation URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://nnqwkmkbvklbezennlfy.supabase.co';
    const finalConfirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

    // Create email template based on action type
    let subject = "";
    let html = "";

    switch (email_action_type) {
      case "signup":
        subject = "Confirmez votre compte LaZone";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 10px;">Bienvenue sur LaZone!</h1>
              <p style="color: #666; font-size: 16px;">Confirmez votre adresse email pour commencer</p>
            </div>
            
            <div style="background: #f7fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Merci de vous être inscrit sur LaZone ! Pour finaliser la création de votre compte, 
                veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${finalConfirmationUrl}" 
                   style="background: #3182ce; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 6px; font-weight: bold; display: inline-block;">
                  Confirmer mon email
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Ou copiez et collez ce lien dans votre navigateur :<br>
                <a href="${finalConfirmationUrl}" style="color: #3182ce; word-break: break-all;">
                  ${finalConfirmationUrl}
                </a>
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
              <p style="margin-top: 20px;">
                <strong>LaZone</strong> - Votre plateforme immobilière de confiance
              </p>
            </div>
          </div>
        `;
        break;

      case "recovery":
        subject = "Réinitialisez votre mot de passe LaZone";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 10px;">Réinitialisation de mot de passe</h1>
              <p style="color: #666; font-size: 16px;">LaZone - Récupération de compte</p>
            </div>
            
            <div style="background: #f7fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous 
                pour créer un nouveau mot de passe.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${finalConfirmationUrl}" 
                   style="background: #e53e3e; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 6px; font-weight: bold; display: inline-block;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Ou copiez et collez ce lien dans votre navigateur :<br>
                <a href="${finalConfirmationUrl}" style="color: #e53e3e; word-break: break-all;">
                  ${finalConfirmationUrl}
                </a>
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
              <p style="margin-top: 20px;">
                <strong>LaZone</strong> - Votre plateforme immobilière de confiance
              </p>
            </div>
          </div>
        `;
        break;

      case "magic_link":
        subject = "Votre lien de connexion LaZone";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 10px;">Connexion rapide</h1>
              <p style="color: #666; font-size: 16px;">LaZone - Lien magique</p>
            </div>
            
            <div style="background: #f7fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Voici votre lien de connexion sécurisé. Cliquez sur le bouton ci-dessous pour vous connecter 
                automatiquement à votre compte LaZone.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${finalConfirmationUrl}" 
                   style="background: #38a169; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 6px; font-weight: bold; display: inline-block;">
                  Se connecter à LaZone
                </a>
              </div>
              
              ${token ? `
              <div style="background: #edf2f7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #2d3748; font-size: 14px; margin-bottom: 8px;">
                  <strong>Code de vérification (si nécessaire) :</strong>
                </p>
                <code style="background: #e2e8f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold;">
                  ${token}
                </code>
              </div>
              ` : ''}
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Ou copiez et collez ce lien dans votre navigateur :<br>
                <a href="${finalConfirmationUrl}" style="color: #38a169; word-break: break-all;">
                  ${finalConfirmationUrl}
                </a>
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>Ce lien expirera dans 1 heure pour votre sécurité.</p>
              <p style="margin-top: 20px;">
                <strong>LaZone</strong> - Votre plateforme immobilière de confiance
              </p>
            </div>
          </div>
        `;
        break;

      default:
        subject = "Notification LaZone";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 10px;">LaZone</h1>
              <p style="color: #666; font-size: 16px;">Notification importante</p>
            </div>
            
            <div style="background: #f7fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
                Une action est requise sur votre compte LaZone.
              </p>
              
              ${finalConfirmationUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${finalConfirmationUrl}" 
                   style="background: #3182ce; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 6px; font-weight: bold; display: inline-block;">
                  Continuer
                </a>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p><strong>LaZone</strong> - Votre plateforme immobilière de confiance</p>
            </div>
          </div>
        `;
    }

    console.log("📧 Preparing to send email");
    console.log("Email details:", { to, subject: subject.substring(0, 50) + "..." });
    
    // Send email via Resend
      const emailResponse = await resend.emails.send({
        from: "LaZone <missdeeofficiel@gmail.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("✅ Email sent successfully via Resend:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ ERROR in send-auth-email function:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorName: error.name,
        details: "Check function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);