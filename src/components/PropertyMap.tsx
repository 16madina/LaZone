import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Layers, Maximize2 } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect: (property: Property) => void;
  onMapBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  className?: string;
  apiKey?: string;
}

export default function PropertyMap({ 
  properties, 
  selectedProperty,
  onPropertySelect,
  onMapBoundsChange,
  className = '',
  apiKey
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [inputApiKey, setInputApiKey] = useState('');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !apiKey) {
      console.log('🗺️ Map init skipped:', { hasContainer: !!mapContainer.current, hasApiKey: !!apiKey });
      return;
    }

    console.log('🗺️ Initializing map with token:', apiKey.substring(0, 20) + '...');

    // Set Mapbox access token
    mapboxgl.accessToken = apiKey;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-4.0333, 5.3167], // Abidjan, Côte d'Ivoire
        zoom: 11,
        pitch: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: false,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully!');
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('🚨 Map error:', e);
        setShowApiKeyInput(true);
      });

      // Listen for map movements
      map.current.on('moveend', () => {
        if (map.current && onMapBoundsChange) {
          onMapBoundsChange(map.current.getBounds());
        }
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('🚨 Error initializing map:', error);
      setShowApiKeyInput(true);
    }
  }, [apiKey, onMapBoundsChange]);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded || !properties.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each property
    properties.forEach(property => {
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, hsl(217, 91%, 25%), hsl(212, 100%, 47%));
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
      `;
      el.textContent = property.purpose === 'rent' ? 'L' : 'V';
      
      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
        el.style.zIndex = '1000';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat(property.location.coordinates)
        .addTo(map.current!);

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'property-popup';
      popupContent.innerHTML = `
        <div class="p-3 max-w-xs">
          <img src="${property.images[0]}" alt="${property.title}" class="w-full h-32 object-cover rounded-lg mb-2" />
          <div class="space-y-1">
            <div class="font-semibold text-sm line-clamp-1">${property.title}</div>
            <div class="text-lg font-bold text-blue-600">
              ${property.price.toLocaleString()} ${property.currency}
              ${property.purpose === 'rent' ? '/mois' : ''}
            </div>
            <div class="text-xs text-gray-600">${property.location.neighborhood}, ${property.location.city}</div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              ${property.bedrooms ? `${property.bedrooms} ch.` : ''} 
              ${property.bathrooms ? `${property.bathrooms} sdb.` : ''} 
              ${property.area} m²
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        anchor: 'bottom'
      }).setDOMContent(popupContent);

      marker.setPopup(popup);

      // Click event
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onPropertySelect(property);
        map.current?.flyTo({
          center: property.location.coordinates,
          zoom: 14,
          duration: 1000
        });
      });

      markers.current.push(marker);
    });

    // Fit map to markers if we have properties
    if (properties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach(property => {
        bounds.extend(property.location.coordinates);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [properties, mapLoaded, onPropertySelect]);

  // Highlight selected property
  useEffect(() => {
    if (!selectedProperty || !mapLoaded) return;

    // Find and highlight the selected marker
    markers.current.forEach((marker, index) => {
      const property = properties[index];
      const el = marker.getElement();
      
      if (property.id === selectedProperty.id) {
        el.style.background = 'linear-gradient(135deg, hsl(0, 84%, 60%), hsl(38, 92%, 50%))';
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1001';
      } else {
        el.style.background = 'linear-gradient(135deg, hsl(217, 91%, 25%), hsl(212, 100%, 47%))';
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      }
    });
  }, [selectedProperty, properties, mapLoaded]);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputApiKey.trim()) {
      window.location.hash = `mapbox_token=${inputApiKey.trim()}`;
      window.location.reload();
    }
  };

  if (showApiKeyInput || !apiKey) {
    return (
      <div className={`relative bg-card border border-border rounded-xl p-8 ${className}`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Configuration Mapbox</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Pour afficher la carte interactive avec les biens immobiliers, connectez votre token Mapbox public.
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-xs text-muted-foreground mb-2">📍 Étapes simples :</p>
            <ol className="text-xs text-muted-foreground space-y-1 text-left">
              <li>1. Créez un compte gratuit sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">mapbox.com</a></li>
              <li>2. Copiez votre "Public token" depuis le dashboard</li>
              <li>3. Collez-le ci-dessous</li>
            </ol>
          </div>

          <form onSubmit={handleApiKeySubmit} className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="pk.eyJ1IjoiYWJjZGVmZy1leGFtcGxl..."
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground">Le token commence par "pk."</p>
            </div>
            <Button type="submit" className="w-full h-11" disabled={!inputApiKey.trim()}>
              🗺️ Activer la carte
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="bg-background/90 backdrop-blur-sm"
          onClick={() => {
            if (map.current && properties.length > 0) {
              const bounds = new mapboxgl.LngLatBounds();
              properties.forEach(property => {
                bounds.extend(property.location.coordinates);
              });
              map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            }
          }}
        >
          <Maximize2 className="w-4 h-4 mr-1" />
          Tout voir
        </Button>
      </div>

      {/* Search in area button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <Button 
          className="bg-primary text-primary-foreground shadow-primary"
          onClick={() => {
            if (map.current && onMapBoundsChange) {
              onMapBoundsChange(map.current.getBounds());
            }
          }}
        >
          Rechercher dans cette zone
        </Button>
      </div>
    </div>
  );
}