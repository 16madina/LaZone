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
  
  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const responseText = await tokenResponse.text();
  console.log("Token exchange status:", tokenResponse.status);
  console.log("Token response preview:", responseText.substring(0, 200));

  if (!tokenResponse.ok) {
    console.error("Token exchange failed:", responseText);
    throw new Error(`Failed to get access token: ${responseText}`);
  }

  const tokenData = JSON.parse(responseText);
  console.log("Got access token, length:", tokenData.access_token?.length);
  console.log("Token type:", tokenData.token_type);
  console.log("Expires in:", tokenData.expires_in);
  console.log("Access token prefix:", tokenData.access_token?.substring(0, 50));
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

    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log("Service account project_id:", serviceAccount.project_id);
      console.log("Service account client_email:", serviceAccount.client_email);
    } catch (e) {
      console.error("Invalid service account JSON:", e);
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

    // Get push_token directly from profiles table (like AYOKA)
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("push_token")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile?.push_token) {
      console.log("No push_token found for user");
      return new Response(
        JSON.stringify({ message: "No push token registered for user", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = profile.push_token;
    console.log(`Found push_token for user, token prefix: ${token.substring(0, 20)}...`);

    // Get OAuth 2.0 access token
    console.log("Starting OAuth token generation...");
    console.log("Private key exists:", !!serviceAccount.private_key);
    console.log("Private key starts with:", serviceAccount.private_key?.substring(0, 30));
    const accessToken = await generateAccessToken(serviceAccount);
    console.log("Access token obtained, length:", accessToken?.length);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

    // Build FCM message
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
      console.log("FCM URL:", fcmUrl);
      console.log("Authorization header length:", `Bearer ${accessToken}`.length);
      console.log("Access token used (first 60 chars):", accessToken?.substring(0, 60));
      console.log("Message payload:", JSON.stringify(message));
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      };
      console.log("Request headers:", JSON.stringify(Object.keys(headers)));
      
      const response = await fetch(fcmUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log(`FCM v1 response status:`, response.status);
      console.log(`FCM v1 response:`, JSON.stringify(result));

      // If token is invalid, clear it from profiles
      if (!response.ok && result.error?.details?.some((d: any) => 
        d.errorCode === "UNREGISTERED" || d.errorCode === "INVALID_ARGUMENT"
      )) {
        console.log("Removing invalid token from profiles");
        await supabaseClient
          .from("profiles")
          .update({ push_token: null })
          .eq("user_id", userId);
      }

      if (response.ok) {
        console.log("Push notification sent successfully");
        return new Response(
          JSON.stringify({
            message: "Push notification sent",
            sent: 1,
            result,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error("FCM error:", result);
        return new Response(
          JSON.stringify({
            error: "FCM request failed",
            details: result,
            sent: 0,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error(`Error sending push notification:`, error);
      return new Response(
        JSON.stringify({ error: "Failed to send notification", sent: 0 }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Error in send-push-notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
