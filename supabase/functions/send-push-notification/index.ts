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

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Generate JWT for FCM v1 OAuth 2.0
async function generateAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: serviceAccount.token_uri,
    iat: now,
    exp: expiry,
  };

  // Base64url encode
  const base64urlEncode = (obj: object) => {
    const str = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerB64 = base64urlEncode(header);
  const payloadB64 = base64urlEncode(payload);
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = serviceAccount.private_key
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  console.log("Exchanging JWT for access token...");
  console.log("Token URI:", serviceAccount.token_uri);
  
  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const responseText = await tokenResponse.text();
  console.log("Token exchange response status:", tokenResponse.status);
  console.log("Token exchange response:", responseText);

  if (!tokenResponse.ok) {
    console.error("Token exchange failed:", responseText);
    throw new Error(`Failed to get access token: ${responseText}`);
  }

  const tokenData = JSON.parse(responseText);
  console.log("Got access token, length:", tokenData.access_token?.length);
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

    if (!serviceAccountJson) {
      console.error("FIREBASE_SERVICE_ACCOUNT not configured");
      return new Response(
        JSON.stringify({ error: "Firebase service account not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Service account JSON length:", serviceAccountJson.length);
    console.log("Service account JSON first 100 chars:", serviceAccountJson.substring(0, 100));

    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log("Parsed service account - project_id:", serviceAccount.project_id);
      console.log("Parsed service account - client_email:", serviceAccount.client_email);
      console.log("Parsed service account - private_key starts with:", serviceAccount.private_key?.substring(0, 30));
    } catch (e) {
      console.error("Invalid service account JSON:", e);
      console.error("Raw JSON that failed to parse:", serviceAccountJson);
      return new Response(
        JSON.stringify({ error: "Invalid service account JSON format" }),
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

    // Get OAuth 2.0 access token
    const accessToken = await generateAccessToken(serviceAccount);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

    // Send notifications to all registered tokens
    const sendPromises = tokens.map(async ({ token, platform }) => {
      const message: Record<string, any> = {
        message: {
          token,
          notification: {
            title,
            body,
          },
          data: data || {},
          android: {
            priority: "high",
            notification: {
              sound: "default",
              channel_id: "lazone_notifications",
              ...(imageUrl && { image: imageUrl }),
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "default",
                badge: 1,
                "mutable-content": 1,
              },
            },
            fcm_options: {
              ...(imageUrl && { image: imageUrl }),
            },
          },
        },
      };

      try {
        const response = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log(`FCM v1 response for token ${token.substring(0, 20)}...:`, result);

        // If token is invalid, remove it from database
        if (!response.ok && result.error?.details?.some((d: any) => 
          d.errorCode === "UNREGISTERED" || d.errorCode === "INVALID_ARGUMENT"
        )) {
          console.log("Removing invalid token from database");
          await supabaseClient
            .from("fcm_tokens")
            .delete()
            .eq("token", token);
        }

        return { token, success: response.ok, result };
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
