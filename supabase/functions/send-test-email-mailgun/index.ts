import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Mailgun configuration
const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY");
const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN");
const MAILGUN_BASE_URL = Deno.env.get("MAILGUN_BASE_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  to: string;
  subject: string;
  message: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 send-test-email-mailgun function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, from }: TestEmailRequest = await req.json();
    
    console.log("📧 Preparing to send test email via Mailgun");
    console.log("Email details:", { to, subject, from });
    console.log("MAILGUN_API_KEY available:", !!MAILGUN_API_KEY);
    console.log("MAILGUN_DOMAIN available:", !!MAILGUN_DOMAIN);
    console.log("MAILGUN_BASE_URL available:", !!MAILGUN_BASE_URL);

    // Prepare email data
    const formData = new FormData();
    formData.append('from', from || `LaZone <noreply@${MAILGUN_DOMAIN}>`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a365d; font-size: 28px; margin-bottom: 10px;">LaZone Test Email</h1>
          <p style="color: #666; font-size: 16px;">Email de test via Mailgun</p>
        </div>
        
        <div style="background: #f7fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
            ${message}
          </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p><strong>LaZone</strong> - Email envoyé avec succès via Mailgun!</p>
        </div>
      </div>
    `);

    // Send email via Mailgun API
    const mailgunUrl = `${MAILGUN_BASE_URL}/v3/${MAILGUN_DOMAIN}/messages`;
    
    const response = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("❌ Mailgun API error:", responseData);
      throw new Error(`Mailgun API error: ${responseData.message || 'Unknown error'}`);
    }

    console.log("✅ Email sent successfully via Mailgun:", responseData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully via Mailgun!",
      data: responseData 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error in send-test-email-mailgun function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);