import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
  reservationId: string;
  status: 'approved' | 'rejected';
  responseMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservationId, status, responseMessage }: ReservationEmailRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch reservation details with property and user info
    const { data: reservation, error: reservationError } = await supabase
      .from('appointments')
      .select(`
        *,
        property:properties(title, address, city, country),
        requester:profiles!appointments_requester_id_fkey(full_name, user_id),
        owner:profiles!appointments_owner_id_fkey(full_name)
      `)
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      console.error('Error fetching reservation:', reservationError);
      return new Response(
        JSON.stringify({ error: 'Reservation not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get requester email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      reservation.requester_id
    );

    if (userError || !userData.user?.email) {
      console.error('Error fetching user email:', userError);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requesterEmail = userData.user.email;
    const requesterName = reservation.requester?.full_name || 'Voyageur';
    const ownerName = reservation.owner?.full_name || 'Le propriétaire';
    const propertyTitle = reservation.property?.title || 'Logement';
    const propertyAddress = `${reservation.property?.address}, ${reservation.property?.city}`;
    
    const checkInDate = new Date(reservation.check_in_date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const checkOutDate = new Date(reservation.check_out_date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let subject: string;
    let htmlContent: string;

    if (status === 'approved') {
      subject = `🎉 Réservation confirmée - ${propertyTitle}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Réservation Confirmée !</h1>
            </div>
            
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Bonjour ${requesterName},</p>
              
              <p style="font-size: 16px; color: #333;">
                Excellente nouvelle ! <strong>${ownerName}</strong> a accepté votre demande de réservation.
              </p>

              <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📋 Détails de votre séjour</h2>
                
                <p style="margin: 8px 0; color: #555;">
                  <strong>🏠 Logement :</strong> ${propertyTitle}
                </p>
                <p style="margin: 8px 0; color: #555;">
                  <strong>📍 Adresse :</strong> ${propertyAddress}
                </p>
                <p style="margin: 8px 0; color: #555;">
                  <strong>📅 Arrivée :</strong> ${checkInDate}
                </p>
                <p style="margin: 8px 0; color: #555;">
                  <strong>📅 Départ :</strong> ${checkOutDate}
                </p>
                <p style="margin: 8px 0; color: #555;">
                  <strong>🌙 Durée :</strong> ${reservation.total_nights} nuit${reservation.total_nights > 1 ? 's' : ''}
                </p>
                <p style="margin: 8px 0; color: #333; font-size: 18px;">
                  <strong>💰 Total :</strong> ${reservation.total_price?.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              ${responseMessage ? `
              <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #333; font-style: italic;">
                  <strong>Message du propriétaire :</strong><br>
                  "${responseMessage}"
                </p>
              </div>
              ` : ''}

              <p style="font-size: 16px; color: #333;">
                Nous vous recommandons de contacter le propriétaire pour organiser les détails de votre arrivée.
              </p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://lazone.app/messages" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold;">
                  Contacter le propriétaire
                </a>
              </div>
            </div>

            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #888; font-size: 14px;">
                LaZone - Location de courte durée en Afrique
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = `Réservation non confirmée - ${propertyTitle}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #6b7280; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Réservation non disponible</h1>
            </div>
            
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Bonjour ${requesterName},</p>
              
              <p style="font-size: 16px; color: #333;">
                Malheureusement, le propriétaire n'a pas pu confirmer votre demande de réservation pour <strong>${propertyTitle}</strong>.
              </p>

              <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 8px 0; color: #555;">
                  <strong>📅 Dates demandées :</strong> ${checkInDate} - ${checkOutDate}
                </p>
              </div>

              ${responseMessage ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #333;">
                  <strong>Raison :</strong><br>
                  "${responseMessage}"
                </p>
              </div>
              ` : ''}

              <p style="font-size: 16px; color: #333;">
                N'hésitez pas à rechercher d'autres logements disponibles sur LaZone.
              </p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://lazone.app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold;">
                  Rechercher un logement
                </a>
              </div>
            </div>

            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #888; font-size: 14px;">
                LaZone - Location de courte durée en Afrique
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "LaZone <noreply@lazone.app>",
      to: [requesterEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-reservation-email function:", error);
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
