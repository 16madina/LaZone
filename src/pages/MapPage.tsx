import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, MapPin, Bed, Bath, Maximize, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  property_type: string;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  lat: number | null;
  lng: number | null;
  property_images: { url: string; is_primary: boolean }[];
}

const formatPriceShort = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${Math.round(price / 1000)}K`;
  }
  return price.toString();
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
};

const MapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');

  // Default center (Abidjan, Côte d'Ivoire)
  const defaultCenter = { lat: 5.3600, lng: -4.0083 };

  useEffect(() => {
    fetchProperties();
    loadLeaflet();
  }, []);

  const loadLeaflet = async () => {
    // Dynamically load Leaflet
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([defaultCenter.lat, defaultCenter.lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      mapRef.current = map;
      setMapLoaded(true);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (url, is_primary)
        `)
        .eq('is_active', true);

      if (error) throw error;
      
      // Add random coordinates for properties without lat/lng (demo purposes)
      const propertiesWithCoords = (data || []).map(p => ({
        ...p,
        lat: p.lat || defaultCenter.lat + (Math.random() - 0.5) * 0.1,
        lng: p.lng || defaultCenter.lng + (Math.random() - 0.5) * 0.1,
      }));
      
      setProperties(propertiesWithCoords);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = searchQuery === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      const matchesPropertyType = propertyTypeFilter === 'all' || p.property_type === propertyTypeFilter;
      return matchesSearch && matchesType && matchesPropertyType;
    });
  }, [properties, searchQuery, typeFilter, propertyTypeFilter]);

  // Update markers when properties change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapRef.current || !mapLoaded) return;
      
      const L = await import('leaflet');
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Add new markers
      filteredProperties.forEach((property) => {
        if (property.lat && property.lng) {
          const bgColor = property.type === 'sale' ? '#ea580c' : '#16a34a';
          const priceText = formatPriceShort(property.price);
          
          const icon = L.divIcon({
            className: 'custom-price-marker',
            html: `
              <div style="
                background: ${bgColor};
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                display: inline-block;
              ">
                ${priceText}
              </div>
            `,
            iconSize: [60, 30],
            iconAnchor: [30, 15],
          });
          
          const marker = L.marker([property.lat, property.lng], { icon })
            .addTo(mapRef.current)
            .on('click', () => {
              setSelectedProperty(property);
            });
          
          markersRef.current.push(marker);
        }
      });
      
      // Fit bounds if there are properties
      if (filteredProperties.length > 0) {
        const validProps = filteredProperties.filter(p => p.lat && p.lng);
        if (validProps.length > 0) {
          const bounds = L.latLngBounds(
            validProps.map(p => [p.lat!, p.lng!] as [number, number])
          );
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    };
    
    updateMarkers();
  }, [filteredProperties, mapLoaded]);

  const getPrimaryImage = (images: { url: string; is_primary: boolean }[]) => {
    const primary = images?.find(img => img.is_primary);
    return primary?.url || images?.[0]?.url || '/placeholder.svg';
  };

  const closePropertyCard = () => {
    setSelectedProperty(null);
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
      {/* Search and Filters Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3">
        <div className="flex gap-2">
          <button className="p-3 bg-card rounded-xl shadow-md border">
            <Filter className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 bg-card border shadow-md"
            />
          </div>
          <button className="p-3 bg-card rounded-xl shadow-md border">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-auto bg-card shadow-md border h-9 px-3">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-[1001]">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="sale">Vente</SelectItem>
              <SelectItem value="rent">Location</SelectItem>
            </SelectContent>
          </Select>

          <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
            <SelectTrigger className="w-auto bg-card shadow-md border h-9 px-3">
              <SelectValue placeholder="Propriété" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-[1001]">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="house">Maison</SelectItem>
              <SelectItem value="apartment">Appartement</SelectItem>
              <SelectItem value="land">Terrain</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>

          <div className="px-3 py-1.5 bg-card rounded-lg shadow-md border text-sm whitespace-nowrap flex items-center">
            {filteredProperties.length} annonce{filteredProperties.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="flex-1 w-full z-0"
        style={{ minHeight: '100%' }}
      />

      {/* Loading Overlay */}
      {(loading || !mapLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-[999]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute right-3 top-32 z-[1000] flex flex-col gap-1">
        <button 
          className="p-3 bg-card rounded-lg shadow-md border text-lg font-bold"
          onClick={handleZoomIn}
        >
          +
        </button>
        <button 
          className="p-3 bg-card rounded-lg shadow-md border text-lg font-bold"
          onClick={handleZoomOut}
        >
          −
        </button>
      </div>

      {/* Selected Property Card */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 left-3 right-3 z-[1000]"
          >
            <div className="bg-card rounded-2xl shadow-xl overflow-hidden border">
              {/* Drag Handle */}
              <div className="flex justify-center pt-2">
                <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              
              {/* Close Button */}
              <button
                onClick={closePropertyCard}
                className="absolute top-3 right-3 p-2 bg-muted rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div 
                className="flex p-3 gap-3 cursor-pointer"
                onClick={() => navigate(`/property/${selectedProperty.id}`)}
              >
                {/* Image */}
                <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                  <img
                    src={getPrimaryImage(selectedProperty.property_images)}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedProperty.type === 'sale' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedProperty.type === 'sale' ? 'Vente' : 'Location'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedProperty.city}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                    {selectedProperty.title}
                  </h3>

                  {/* Location */}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {selectedProperty.address}
                  </p>

                  {/* Price */}
                  <p className="text-primary font-bold">
                    {formatPrice(selectedProperty.price)}
                    {selectedProperty.type === 'rent' && <span className="text-xs font-normal">/mois</span>}
                  </p>

                  {/* Features */}
                  {selectedProperty.property_type !== 'land' && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {selectedProperty.bedrooms && selectedProperty.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {selectedProperty.bedrooms}
                        </span>
                      )}
                      {selectedProperty.bathrooms && selectedProperty.bathrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-3 h-3" />
                          {selectedProperty.bathrooms}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3 h-3" />
                        {selectedProperty.area}m²
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;
