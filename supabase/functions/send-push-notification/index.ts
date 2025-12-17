import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIREBASE_SERVER_KEY = Deno.env.get("FIREBASE_SERVER_KEY");
    
    if (!FIREBASE_SERVER_KEY) {
      console.error("FIREBASE_SERVER_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Firebase server key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, title, body, data, imageUrl }: PushPayload = await req.json();

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: "userId, title, and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending push notification to user: ${userId}`);

    // Get all FCM tokens for the user
    const { data: tokens, error: tokensError } = await supabaseClient
      .from("fcm_tokens")
      .select("token, platform")
      .eq("user_id", userId);

    if (tokensError) {
      console.error("Error fetching tokens:", tokensError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user tokens" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log("No FCM tokens found for user");
      return new Response(
        JSON.stringify({ message: "No tokens registered for user", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${tokens.length} tokens for user`);

    // Send notifications to all registered tokens
    const sendPromises = tokens.map(async ({ token, platform }) => {
      const message: Record<string, any> = {
        to: token,
        notification: {
          title,
          body,
          sound: "default",
          badge: 1,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        priority: "high",
      };

      // Add image for Android
      if (imageUrl && platform === "android") {
        message.notification.image = imageUrl;
      }

      // iOS specific settings
      if (platform === "ios") {
        message.content_available = true;
        message.mutable_content = true;
        if (imageUrl) {
          message.data.image = imageUrl;
        }
      }

      try {
        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${FIREBASE_SERVER_KEY}`,
          },
          body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log(`FCM response for token ${token.substring(0, 20)}...:`, result);

        // If token is invalid, remove it from database
        if (result.failure === 1 && result.results?.[0]?.error === "NotRegistered") {
          console.log("Removing invalid token from database");
          await supabaseClient
            .from("fcm_tokens")
            .delete()
            .eq("token", token);
        }

        return { token, success: result.success === 1, result };
      } catch (error) {
        console.error(`Error sending to token ${token.substring(0, 20)}...:`, error);
        return { token, success: false, error };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;

    console.log(`Sent ${successCount}/${tokens.length} notifications successfully`);

    return new Response(
      JSON.stringify({
        message: "Push notifications sent",
        sent: successCount,
        total: tokens.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-push-notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
