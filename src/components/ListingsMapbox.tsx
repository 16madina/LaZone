import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Listing = { 
  id: string; 
  title: string; 
  latitude: number | null; 
  longitude: number | null; 
  price?: number | null; 
};

export default function ListingsMapbox({ 
  listings, 
  fallbackCenter = [-5.55, 7.54] /* lon, lat CI */ 
}: {
  listings: Listing[];
  fallbackCenter?: [number, number];
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Récupérer le token Mapbox depuis Supabase
  useEffect(() => {
    async function getMapboxToken() {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        
        if (data?.token) {
          setMapboxToken(data.token);
          mapboxgl.accessToken = data.token;
        } else {
          console.error('Token Mapbox non trouvé');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token Mapbox:', error);
      } finally {
        setLoading(false);
      }
    }

    getMapboxToken();
  }, []);

  // Init carte
  useEffect(() => {
    if (mapRef.current || !containerRef.current || !mapboxToken || loading) return;
    
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: fallbackCenter,
      zoom: 5
    });

    // Ajouter les contrôles de navigation
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => { 
      mapRef.current?.remove(); 
      mapRef.current = null; 
    };
  }, [fallbackCenter, mapboxToken, loading]);

  // Markers à chaque mise à jour des listings
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;

    // Clear anciens markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const coords = listings.filter(l => l.latitude && l.longitude)
      .map(l => ({ 
        l, 
        coord: [l.longitude as number, l.latitude as number] as [number, number] 
      }));

    coords.forEach(({ l, coord }) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        width: 12px; 
        height: 12px;
        border-radius: 9999px; 
        background: hsl(var(--primary));
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coord)
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 12,
            closeButton: false,
            closeOnClick: false 
          }).setHTML(`
            <div class="p-2 min-w-[180px]">
              <div class="font-semibold text-sm mb-1">${l.title}</div>
              ${l.price ? `<div class="text-primary font-bold">${Number(l.price).toLocaleString()} FCFA</div>` : ''}
            </div>
          `)
        )
        .addTo(map);
      
      markersRef.current.push(marker);

      // Événements hover
      el.addEventListener('mouseenter', () => {
        marker.getPopup().addTo(map);
      });
      
      el.addEventListener('mouseleave', () => {
        marker.getPopup().remove();
      });
    });

    // Fit bounds si on a des points
    if (coords.length > 0) {
      const bounds = coords.reduce(
        (b, { coord }) => b.extend(coord), 
        new mapboxgl.LngLatBounds(coords[0].coord, coords[0].coord)
      );
      map.fitBounds(bounds, { 
        padding: 40, 
        duration: 0,
        maxZoom: 12 
      });
    } else {
      map.setCenter(fallbackCenter);
      map.setZoom(5);
    }
  }, [listings, fallbackCenter, loading]);

  if (loading) {
    return (
      <div className="h-[320px] md:h-[420px] rounded-lg border flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="h-[320px] md:h-[420px] rounded-lg border flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Impossible de charger la carte</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[320px] md:h-[420px] rounded-lg overflow-hidden border" />
      
      {listings.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <p className="text-xs text-muted-foreground">
            {listings.filter(l => l.latitude && l.longitude).length} annonce(s) sur la carte
          </p>
        </div>
      )}
    </div>
  );
}