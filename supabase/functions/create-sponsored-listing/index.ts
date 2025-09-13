import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SponsoredListingRequest {
  listing_id: string;
  boost_level: number; // 1, 2, 3
  duration: number; // 7, 15, 30 days
}

// Prix et produits Stripe mapping
const SPONSORSHIP_PRICES = {
  1: { // Boost
    7: "price_1S6hPwCegYRLhK0ajxlB1XPi",
    15: "price_1S6hQDCegYRLhK0abpbixjC9",
    30: "price_1S6hQgCegYRLhK0aLUs9P4Yh"
  },
  2: { // Premium
    7: "price_1S6hR2CegYRLhK0aNtGryjLt",
    15: "price_1S6hRDCegYRLhK0az5kT2BwZ", 
    30: "price_1S6hSJCegYRLhK0aNuQKbjzO"
  },
  3: { // VIP
    7: "price_1S6hV7CegYRLhK0aJyEN2ZZK",
    15: "price_1S6hVeCegYRLhK0axRtN6pS5",
    30: "price_1S6hVtCegYRLhK0aOLPnspKR"
  }
};

const SPONSORSHIP_PRICES_XOF = {
  1: { 7: 200000, 15: 350000, 30: 600000 },
  2: { 7: 350000, 15: 600000, 30: 1000000 },
  3: { 7: 500000, 15: 850000, 30: 1500000 }
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SPONSORED-LISTING] ${step}${detailsStr}`);
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request data
    const { listing_id, boost_level, duration }: SponsoredListingRequest = await req.json();
    logStep("Request parsed", { listing_id, boost_level, duration });

    // Validate parameters
    if (!listing_id || !boost_level || !duration) {
      throw new Error("Missing required parameters: listing_id, boost_level, duration");
    }

    if (![1, 2, 3].includes(boost_level)) {
      throw new Error("boost_level must be 1, 2, or 3");
    }

    if (![7, 15, 30].includes(duration)) {
      throw new Error("duration must be 7, 15, or 30 days");
    }

    // Verify user owns the listing
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('id, user_id, title, status')
      .eq('id', listing_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found or you don't own this listing");
    }
    logStep("Listing verified", { listingId: listing.id, title: listing.title });

    // Check for existing active sponsorship
    const { data: existingSponsor } = await supabaseClient
      .from('sponsored_listings')
      .select('id, sponsored_until, boost_level')
      .eq('listing_id', listing_id)
      .eq('status', 'active')
      .gt('sponsored_until', new Date().toISOString())
      .single();

    if (existingSponsor) {
      logStep("Existing sponsorship found", existingSponsor);
      throw new Error(`Cette annonce est déjà sponsorisée jusqu'au ${new Date(existingSponsor.sponsored_until).toLocaleDateString('fr-FR')}`);
    }

    // Get price ID
    const priceId = SPONSORSHIP_PRICES[boost_level as keyof typeof SPONSORSHIP_PRICES]?.[duration as keyof typeof SPONSORSHIP_PRICES[1]];
    const priceAmount = SPONSORSHIP_PRICES_XOF[boost_level as keyof typeof SPONSORSHIP_PRICES_XOF]?.[duration as keyof typeof SPONSORSHIP_PRICES_XOF[1]];
    
    if (!priceId) {
      throw new Error("Invalid boost_level or duration combination");
    }
    logStep("Price determined", { priceId, priceAmount });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }
    logStep("Stripe customer resolved", { customerId });

    // Calculate sponsorship end date
    const sponsoredUntil = new Date();
    sponsoredUntil.setDate(sponsoredUntil.getDate() + duration);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        listing_id: listing_id,
        user_id: user.id,
        boost_level: boost_level.toString(),
        duration: duration.toString(),
        sponsored_until: sponsoredUntil.toISOString(),
        amount_paid: priceAmount.toString()
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      boost_level,
      duration,
      price_amount: priceAmount,
      sponsored_until: sponsoredUntil.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});