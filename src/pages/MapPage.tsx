import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, MapPin, Bed, Bath, Maximize, Search, Loader2, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppStore, Property as StoreProperty } from '@/stores/appStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

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
  const markersRef = useRef<any>(null); // MarkerClusterGroup
  const userMarkerRef = useRef<any>(null);
  const { properties, searchQuery: storeSearchQuery, activeFilter } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<StoreProperty | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  // Default center (Abidjan, Côte d'Ivoire)
  const defaultCenter = { lat: 5.3600, lng: -4.0083 };

  useEffect(() => {
    loadLeaflet();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocatingUser(false);
        
        // Center map on user location
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 13);
          addUserMarker(latitude, longitude);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocatingUser(false);
        // Don't show error toast, just use default location
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const addUserMarker = async (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    const L = await import('leaflet');
    
    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
        "></div>
        <div style="
          position: absolute;
          top: -5px;
          left: -5px;
          width: 30px;
          height: 30px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    
    userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(mapRef.current);
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    } else {
      getUserLocation();
    }
  };

  const loadLeaflet = async () => {
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    await import('leaflet.markercluster');
    await import('leaflet.markercluster/dist/MarkerCluster.css');
    await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
    
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([defaultCenter.lat, defaultCenter.lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      // Create marker cluster group with custom styling
      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div style="
              background: linear-gradient(135deg, #ea580c, #f97316);
              color: white;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 14px;
              box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4);
              border: 3px solid white;
            ">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(40, 40),
          });
        }
      });
      
      map.addLayer(clusterGroup);
      markersRef.current = clusterGroup;
      
      mapRef.current = map;
      setMapLoaded(true);
      setLoading(false);
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = searchQuery === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      const matchesPropertyType = propertyTypeFilter === 'all' || p.propertyType === propertyTypeFilter;
      return matchesSearch && matchesType && matchesPropertyType;
    });
  }, [properties, searchQuery, typeFilter, propertyTypeFilter]);

  // Update markers when properties change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapRef.current || !mapLoaded || !markersRef.current) return;
      
      const L = await import('leaflet');
      
      // Clear existing markers from cluster group
      markersRef.current.clearLayers();
      
      // Add new markers to cluster group
      filteredProperties.forEach((property) => {
        if (property.lat && property.lng) {
          const bgColor = property.type === 'sale' ? '#ea580c' : '#16a34a';
          const priceText = formatPriceShort(property.price);
          const isSelected = selectedProperty?.id === property.id;
          
          const icon = L.divIcon({
            className: 'custom-price-marker',
            html: `
              <div style="
                background: ${isSelected ? '#1d4ed8' : bgColor};
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                display: inline-block;
                transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
                transition: transform 0.2s;
              ">
                ${priceText}
              </div>
            `,
            iconSize: [60, 30],
            iconAnchor: [30, 15],
          });
          
          const marker = L.marker([property.lat, property.lng], { icon })
            .on('click', () => {
              setSelectedProperty(property);
            });
          
          markersRef.current.addLayer(marker);
        }
      });
      
      // Fit bounds if there are properties and no user location
      if (filteredProperties.length > 0 && !userLocation) {
        const validProps = filteredProperties.filter(p => p.lat && p.lng);
        if (validProps.length > 0) {
          const bounds = L.latLngBounds(
            validProps.map(p => [p.lat, p.lng] as [number, number])
          );
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    };
    
    updateMarkers();
  }, [filteredProperties, mapLoaded, selectedProperty]);

  const getPrimaryImage = (images: string[]) => {
    return images?.[0] || '/placeholder.svg';
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
          <button 
            className={`p-3 rounded-xl shadow-md border ${userLocation ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
            onClick={centerOnUser}
            disabled={locatingUser}
          >
            {locatingUser ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
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
                    src={getPrimaryImage(selectedProperty.images)}
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
                  {selectedProperty.propertyType !== 'land' && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {selectedProperty.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {selectedProperty.bedrooms}
                        </span>
                      )}
                      {selectedProperty.bathrooms > 0 && (
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
