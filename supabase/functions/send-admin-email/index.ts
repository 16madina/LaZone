import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminEmailRequest {
  to: string;
  subject: string;
  message: string;
  recipient_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, recipient_name }: AdminEmailRequest = await req.json();

    console.log(`Sending admin email to: ${to}`);

    const emailResponse = await resend.emails.send({
      from: "LaZone Admin <onboarding@resend.dev>",
      to: [to],
      subject: `[LaZone Admin] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Message de l'administration LaZone
          </h2>
          
          <p style="color: #666; margin-bottom: 20px;">
            Bonjour ${recipient_name},
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; line-height: 1.6; white-space: pre-line;">
              ${message}
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #888; font-size: 14px;">
            Ce message vous a été envoyé par l'équipe d'administration de LaZone.
            <br>
            Si vous avez des questions, vous pouvez nous contacter via l'application.
          </p>
          
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            LaZone - Plateforme immobilière
          </p>
        </div>
      `,
    });

    console.log("Admin email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-email function:", error);
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