import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Home, Building2, MapPin, Bed, Bath, Maximize, X, Search, MapIcon, Calendar, Star, Wifi, Car, Shield, Dumbbell, Coffee, TreePine, Sun, Eye } from "lucide-react";
import { FilterState } from "@/components/PropertyFilters";

interface AdvancedPropertyFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  searchMode: 'rent' | 'buy';
}

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Appartement', icon: Building2 },
  { id: 'house', label: 'Maison', icon: Home },
  { id: 'land', label: 'Terrain', icon: MapPin }
];

const ENHANCED_AMENITIES = [
  { id: 'pool', label: 'Piscine', icon: Sun },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'furnished', label: 'Meublé', icon: Home },
  { id: 'security', label: 'Sécurité 24/7', icon: Shield },
  { id: 'fiber', label: 'Fibre', icon: Wifi },
  { id: 'ac', label: 'Climatisation', icon: Sun },
  { id: 'elevator', label: 'Ascenseur', icon: Building2 },
  { id: 'balcony', label: 'Balcon', icon: Eye },
  { id: 'garden', label: 'Jardin', icon: TreePine },
  { id: 'sea_view', label: 'Vue mer', icon: Eye },
  { id: 'new', label: 'Neuf', icon: Star },
  { id: 'gym', label: 'Salle de sport', icon: Dumbbell },
  { id: 'restaurant', label: 'Restaurant', icon: Coffee }
];

const NEIGHBORHOODS = [
  'Plateau', 'Cocody', 'Yopougon', 'Marcory', 'Treichville', 
  'Adjamé', 'Koumassi', 'Port-Bouët', 'Attecoube', 'Abobo'
];

const CITIES = [
  'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro',
  'Korhogo', 'Man', 'Divo', 'Gagnoa', 'Abengourou'
];

export default function AdvancedPropertyFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  searchMode 
}: AdvancedPropertyFiltersProps) {
  if (!isOpen) return null;

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyType.includes(type)
      ? filters.propertyType.filter(t => t !== type)
      : [...filters.propertyType, type];
    updateFilters({ propertyType: newTypes });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilters({ amenities: newAmenities });
  };

  const maxPrice = searchMode === 'rent' ? 2000000 : 50000000;
  const priceLabel = searchMode === 'rent' ? 'Loyer mensuel' : 'Prix d\'achat';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-card shadow-xl animate-slide-up overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-card">
            <h2 className="text-xl font-semibold">Filtres avancés</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-40 space-y-8">
            {/* Search by Location */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Recherche par localisation
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="city-search" className="text-xs text-muted-foreground">Ville</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="neighborhood-search" className="text-xs text-muted-foreground">Quartier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un quartier" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEIGHBORHOODS.map(neighborhood => (
                        <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h3 className="text-sm font-medium mb-3">Type de bien</h3>
              <div className="grid grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = filters.propertyType.includes(type.id);
                  return (
                    <Button
                      key={type.id}
                      variant="outline"
                      onClick={() => togglePropertyType(type.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 h-auto py-3 transition-all duration-normal",
                        isSelected && "bg-primary text-primary-foreground border-primary"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                {priceLabel} (CFA)
              </h3>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  max={maxPrice}
                  min={0}
                  step={searchMode === 'rent' ? 25000 : 500000}
                  className="mb-3"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filters.priceRange[0].toLocaleString()} CFA</span>
                  <span>{filters.priceRange[1].toLocaleString()} CFA</span>
                </div>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  Chambres
                </h3>
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilters({ bedrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Toutes</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  Salle de bain
                </h3>
                <Select value={filters.bathrooms} onValueChange={(value) => updateFilters({ bathrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Toutes</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area Range */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Maximize className="w-4 h-4" />
                Surface (m²)
              </h3>
              <div className="px-3">
                <Slider
                  value={filters.areaRange}
                  onValueChange={(value) => updateFilters({ areaRange: value as [number, number] })}
                  max={1000}
                  min={20}
                  step={10}
                  className="mb-3"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filters.areaRange[0]} m²</span>
                  <span>{filters.areaRange[1]} m²</span>
                </div>
              </div>
            </div>

            {/* Enhanced Amenities */}
            <div>
              <h3 className="text-sm font-medium mb-3">Commodités</h3>
              <div className="grid grid-cols-2 gap-2">
                {ENHANCED_AMENITIES.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = filters.amenities.includes(amenity.id);
                  return (
                    <Button
                      key={amenity.id}
                      variant="outline"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={cn(
                        "flex items-center gap-2 h-auto py-2 px-3 justify-start text-xs transition-all duration-fast",
                        isSelected && "bg-primary text-primary-foreground border-primary"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {amenity.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <h3 className="text-sm font-medium mb-3">Filtres supplémentaires</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Propriétés récentes</Label>
                    <p className="text-xs text-muted-foreground">Ajoutées dans les 7 derniers jours</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Avec photos</Label>
                    <p className="text-xs text-muted-foreground">Annonces avec au moins 3 photos</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Agent vérifié</Label>
                    <p className="text-xs text-muted-foreground">Publiée par un agent certifié</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Visite virtuelle</Label>
                    <p className="text-xs text-muted-foreground">Avec visite 3D ou vidéo</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gradient-card sticky bottom-0 z-10">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  updateFilters({
                    propertyType: [],
                    priceRange: [0, maxPrice],
                    bedrooms: 'any',
                    bathrooms: 'any',
                    areaRange: [20, 1000],
                    amenities: []
                  });
                }}
              >
                Réinitialiser
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}