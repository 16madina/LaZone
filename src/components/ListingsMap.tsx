import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

type Listing = {
  id: string;
  title: string;
  price: number | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  city?: { name: string; slug: string } | null;
};

interface ListingsMapProps {
  listings: Listing[];
}

export function ListingsMap({ listings }: ListingsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
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

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || loading) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-5.5471, 7.5400], // Centre sur la Côte d'Ivoire
      zoom: 6,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, loading]);

  // Ajouter les marqueurs des annonces
  useEffect(() => {
    if (!map.current || loading) return;

    // Supprimer les marqueurs existants
    const existingMarkers = document.querySelectorAll('.mapbox-marker');
    existingMarkers.forEach(marker => marker.remove());

    const validListings = listings.filter(
      listing => listing.latitude !== null && listing.longitude !== null
    );

    if (validListings.length === 0) return;

    // Ajouter les nouveaux marqueurs
    validListings.forEach(listing => {
      if (listing.latitude === null || listing.longitude === null) return;

      // Créer l'élément du marqueur
      const markerElement = document.createElement('div');
      markerElement.className = 'mapbox-marker';
      markerElement.style.cssText = `
        background-color: hsl(var(--primary));
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Créer le popup
      const popup = new mapboxgl.Popup({
        offset: 15,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold mb-2 text-sm">${listing.title}</h3>
          ${listing.price ? `<p class="text-primary font-bold mb-1">${listing.price.toLocaleString()} FCFA</p>` : ''}
          <p class="text-xs text-muted-foreground">
            ${listing.city?.name || ''}
            ${listing.neighborhood ? ` • ${listing.neighborhood}` : ''}
          </p>
        </div>
      `);

      // Créer le marqueur
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([listing.longitude, listing.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Ajouter les événements
      markerElement.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });

      markerElement.addEventListener('mouseleave', () => {
        popup.remove();
      });

      markerElement.addEventListener('click', () => {
        // Optionnel: navigation vers le détail de l'annonce
        console.log('Clic sur l\'annonce:', listing.id);
      });
    });

    // Ajuster la vue pour montrer tous les marqueurs
    if (validListings.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      validListings.forEach(listing => {
        if (listing.latitude !== null && listing.longitude !== null) {
          bounds.extend([listing.longitude, listing.latitude]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12
        });
      }
    }
  }, [listings, loading]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Impossible de charger la carte</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
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