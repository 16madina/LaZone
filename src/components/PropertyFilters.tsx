import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Home, Building2, MapPin, Bed, Bath, Maximize, X } from "lucide-react";

export interface FilterState {
  propertyType: string[];
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  areaRange: [number, number];
  amenities: string[];
}

interface PropertyFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  searchMode: 'rent' | 'buy' | 'commercial';
}

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Appartement', icon: Building2 },
  { id: 'house', label: 'Maison', icon: Home },
  { id: 'land', label: 'Terrain', icon: MapPin },
  { id: 'commercial', label: 'Commercial', icon: Building2 }
];

const AMENITIES = [
  'Piscine', 'Parking', 'Meublé', 'Sécurité 24/7', 
  'Fibre', 'Climatisation', 'Ascenseur', 'Balcon',
  'Jardin', 'Vue mer', 'Neuf', 'Salle de sport',
  'Cuisine équipée', 'Terrasse', 'Cave', 'Garage',
  'Concierge', 'Buanderie', 'Cheminée', 'Dressing',
  'Bureau', 'Internet haut débit', 'Système d\'alarme'
];

export default function PropertyFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  searchMode 
}: PropertyFiltersProps) {
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

  const maxPrice = searchMode === 'rent' ? 2000000 : searchMode === 'buy' ? 50000000 : 5000000; // CFA
  const priceLabel = searchMode === 'rent' ? 'Loyer mensuel' : searchMode === 'buy' ? 'Prix d\'achat' : 'Loyer commercial';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-card shadow-xl animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Filtres</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8">
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

            {/* Amenities */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Commodités</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
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
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Annuler tous les filtres
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => {
                  const isSelected = filters.amenities.includes(amenity);
                  return (
                    <Badge
                      key={amenity}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all duration-fast",
                        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      )}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Badge>
                  );
                })}
              </div>
              
              {/* Action buttons for amenities */}
              <div className="flex gap-3 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => updateFilters({ amenities: [] })}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1"
                  onClick={onClose}
                >
                  Sauvegarder
                </Button>
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