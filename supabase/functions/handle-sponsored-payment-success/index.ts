import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-SPONSORED-PAYMENT-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request data
    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error("Missing session_id parameter");
    }
    logStep("Session ID received", { session_id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Checkout session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      metadata: session.metadata 
    });

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    // Extract metadata
    const {
      listing_id,
      user_id,
      boost_level,
      duration,
      sponsored_until,
      amount_paid
    } = session.metadata || {};

    if (!listing_id || !user_id || !boost_level || !duration || !sponsored_until || !amount_paid) {
      throw new Error("Missing required metadata in session");
    }

    logStep("Metadata extracted", {
      listing_id,
      user_id,
      boost_level: parseInt(boost_level),
      duration: parseInt(duration),
      sponsored_until,
      amount_paid: parseInt(amount_paid)
    });

    // Check if sponsorship record already exists (to avoid duplicates)
    const { data: existing } = await supabaseClient
      .from('sponsored_listings')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('user_id', user_id)
      .eq('status', 'active')
      .gt('sponsored_until', new Date().toISOString())
      .single();

    if (existing) {
      logStep("Sponsorship already exists", { existingId: existing.id });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Sponsorship already active",
        sponsored_listing_id: existing.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Cancel any existing active sponsorships for this listing
    await supabaseClient
      .from('sponsored_listings')
      .update({ status: 'cancelled' })
      .eq('listing_id', listing_id)
      .eq('status', 'active');

    logStep("Previous sponsorships cancelled");

    // Create new sponsored listing record
    const { data: sponsoredListing, error: insertError } = await supabaseClient
      .from('sponsored_listings')
      .insert({
        listing_id: listing_id,
        user_id: user_id,
        sponsored_from: new Date().toISOString(),
        sponsored_until: sponsored_until,
        amount_paid: parseInt(amount_paid),
        currency: 'XOF',
        status: 'active',
        boost_level: parseInt(boost_level)
      })
      .select('id')
      .single();

    if (insertError) {
      logStep("Insert error", { error: insertError });
      throw new Error(`Failed to create sponsored listing: ${insertError.message}`);
    }

    logStep("Sponsored listing created successfully", { 
      sponsoredListingId: sponsoredListing.id,
      listing_id,
      boost_level: parseInt(boost_level),
      duration: parseInt(duration)
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Sponsorship activated successfully",
      sponsored_listing_id: sponsoredListing.id,
      details: {
        listing_id,
        boost_level: parseInt(boost_level),
        duration: parseInt(duration),
        sponsored_until,
        amount_paid: parseInt(amount_paid)
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});