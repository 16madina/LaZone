import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`[MAPBOX-TOKEN] Function called with method: ${req.method}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[MAPBOX-TOKEN] CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[MAPBOX-TOKEN] Attempting to get token from environment')
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    if (!mapboxToken) {
      console.error('[MAPBOX-TOKEN] Token not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          message: 'Please configure MAPBOX_PUBLIC_TOKEN in Supabase Edge Function secrets' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[MAPBOX-TOKEN] Token found, length: ${mapboxToken.length}, prefix: ${mapboxToken.substring(0, 10)}...`)
    
    return new Response(
      JSON.stringify({ mapboxToken }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error(`[MAPBOX-TOKEN] Error occurred: ${error.message}`, error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Internal server error while fetching Mapbox token'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})