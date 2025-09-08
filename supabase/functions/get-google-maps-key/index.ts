import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`[GOOGLE-MAPS] Function called with method: ${req.method}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[GOOGLE-MAPS] CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[GOOGLE-MAPS] Attempting to get API key from environment')
    const googleMapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!googleMapsKey) {
      console.error('[GOOGLE-MAPS] API key not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Google Maps API key not configured',
          message: 'Please configure GOOGLE_MAPS_API_KEY in Supabase Edge Function secrets' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[GOOGLE-MAPS] API key found, length: ${googleMapsKey.length}, prefix: ${googleMapsKey.substring(0, 10)}...`)
    
    return new Response(
      JSON.stringify({ googleMapsKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error(`[GOOGLE-MAPS] Error occurred: ${error.message}`, error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Internal server error while fetching Google Maps API key'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})