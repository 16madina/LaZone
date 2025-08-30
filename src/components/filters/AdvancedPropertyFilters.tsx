import React, { useState } from 'react';
import { Search, MapPin, Filter, X, Star, Calendar, Ruler, Bed, Bath, Wifi, Car, Waves, Dumbbell, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface AdvancedFilterState {
  searchText: string;
  propertyTypes: string[];
  purpose: 'buy' | 'rent';
  priceRange: [number, number];
  areaRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  amenities: string[];
  condition: string[];
  yearBuilt: [number, number];
  features: string[];
  location: {
    country?: string;
    city?: string;
    neighborhood?: string;
    radius?: number;
  };
  verified: boolean;
  hasImages: boolean;
  hasVirtualTour: boolean;
  sortBy: string;
}

interface AdvancedPropertyFiltersProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedFilterState;
  onFiltersChange: (filters: AdvancedFilterState) => void;
  searchMode: 'buy' | 'rent';
}

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Appartement', icon: '🏢' },
  { id: 'house', label: 'Maison', icon: '🏠' },
  { id: 'villa', label: 'Villa', icon: '🏡' },
  { id: 'land', label: 'Terrain', icon: '🏞️' },
  { id: 'office', label: 'Bureau', icon: '🏢' },
  { id: 'shop', label: 'Commerce', icon: '🏪' },
  { id: 'warehouse', label: 'Entrepôt', icon: '🏭' }
];

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'pool', label: 'Piscine', icon: Waves },
  { id: 'gym', label: 'Salle de sport', icon: Dumbbell },
  { id: 'security', label: 'Sécurité 24h', icon: Shield },
  { id: 'generator', label: 'Générateur', icon: Zap },
  { id: 'garden', label: 'Jardin', icon: '🌿' },
  { id: 'terrace', label: 'Terrasse', icon: '🏡' }
];

const CONDITIONS = [
  { id: 'new', label: 'Neuf' },
  { id: 'excellent', label: 'Excellent état' },
  { id: 'good', label: 'Bon état' },
  { id: 'renovation', label: 'À rénover' }
];

const FEATURES = [
  { id: 'furnished', label: 'Meublé' },
  { id: 'air_conditioning', label: 'Climatisation' },
  { id: 'balcony', label: 'Balcon' },
  { id: 'elevator', label: 'Ascenseur' },
  { id: 'fireplace', label: 'Cheminée' },
  { id: 'garage', label: 'Garage privé' }
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Plus récent' },
  { id: 'price_asc', label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'area_desc', label: 'Surface décroissante' },
  { id: 'rating', label: 'Mieux notés' }
];

const AdvancedPropertyFilters: React.FC<AdvancedPropertyFiltersProps> = ({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  searchMode
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilterState>(filters);

  const resetFilters = () => {
    const defaultFilters: AdvancedFilterState = {
      searchText: '',
      propertyTypes: [],
      purpose: searchMode,
      priceRange: [0, searchMode === 'rent' ? 2000000 : 100000000],
      areaRange: [0, 1000],
      bedrooms: [],
      bathrooms: [],
      amenities: [],
      condition: [],
      yearBuilt: [1950, new Date().getFullYear()],
      features: [],
      location: {},
      verified: false,
      hasImages: false,
      hasVirtualTour: false,
      sortBy: 'newest'
    };
    setLocalFilters(defaultFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.searchText) count++;
    if (localFilters.propertyTypes.length > 0) count++;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < (searchMode === 'rent' ? 2000000 : 100000000)) count++;
    if (localFilters.areaRange[0] > 0 || localFilters.areaRange[1] < 1000) count++;
    if (localFilters.bedrooms.length > 0) count++;
    if (localFilters.bathrooms.length > 0) count++;
    if (localFilters.amenities.length > 0) count++;
    if (localFilters.condition.length > 0) count++;
    if (localFilters.features.length > 0) count++;
    if (localFilters.verified) count++;
    if (localFilters.hasImages) count++;
    if (localFilters.hasVirtualTour) count++;
    return count;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtres avancés
          {getActiveFiltersCount() > 0 && (
            <Badge className="ml-2" variant="secondary">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-96 p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres avancés
            </SheetTitle>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-full pb-20">
          <div className="p-6 space-y-6">
            {/* Recherche par texte */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Recherche par mot-clé
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Titre, description, quartier..."
                  value={localFilters.searchText}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, searchText: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Types de propriété */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Types de propriété
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map(type => (
                  <Button
                    key={type.id}
                    variant={localFilters.propertyTypes.includes(type.id) ? "default" : "outline"}
                    size="sm"
                    className="justify-start h-auto p-3"
                    onClick={() => {
                      setLocalFilters(prev => ({
                        ...prev,
                        propertyTypes: prev.propertyTypes.includes(type.id)
                          ? prev.propertyTypes.filter(t => t !== type.id)
                          : [...prev.propertyTypes, type.id]
                      }));
                    }}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Prix */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Prix ({searchMode === 'rent' ? 'par mois' : 'total'}) - CFA
              </Label>
              <div className="space-y-4">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                  min={0}
                  max={searchMode === 'rent' ? 2000000 : 100000000}
                  step={searchMode === 'rent' ? 50000 : 1000000}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.priceRange[0]}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      priceRange: [Number(e.target.value), prev.priceRange[1]]
                    }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.priceRange[1]}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value)]
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Surface */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Surface (m²)
              </Label>
              <div className="space-y-4">
                <Slider
                  value={localFilters.areaRange}
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, areaRange: value as [number, number] }))}
                  min={0}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.areaRange[0]}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      areaRange: [Number(e.target.value), prev.areaRange[1]]
                    }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.areaRange[1]}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      areaRange: [prev.areaRange[0], Number(e.target.value)]
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Chambres et salles de bain */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  <Bed className="w-4 h-4 inline mr-2" />
                  Chambres
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <Button
                      key={num}
                      variant={localFilters.bedrooms.includes(num) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setLocalFilters(prev => ({
                          ...prev,
                          bedrooms: prev.bedrooms.includes(num)
                            ? prev.bedrooms.filter(b => b !== num)
                            : [...prev.bedrooms, num]
                        }));
                      }}
                    >
                      {num}+
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  <Bath className="w-4 h-4 inline mr-2" />
                  Salles de bain
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4].map(num => (
                    <Button
                      key={num}
                      variant={localFilters.bathrooms.includes(num) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setLocalFilters(prev => ({
                          ...prev,
                          bathrooms: prev.bathrooms.includes(num)
                            ? prev.bathrooms.filter(b => b !== num)
                            : [...prev.bathrooms, num]
                        }));
                      }}
                    >
                      {num}+
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Équipements */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Équipements
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map(amenity => {
                  const Icon = typeof amenity.icon === 'string' ? () => <span>{amenity.icon}</span> : amenity.icon;
                  return (
                    <Button
                      key={amenity.id}
                      variant={localFilters.amenities.includes(amenity.id) ? "default" : "outline"}
                      size="sm"
                      className="justify-start h-auto p-3"
                      onClick={() => {
                        setLocalFilters(prev => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity.id)
                            ? prev.amenities.filter(a => a !== amenity.id)
                            : [...prev.amenities, amenity.id]
                        }));
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {amenity.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* État de la propriété */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                État de la propriété
              </Label>
              <div className="space-y-2">
                {CONDITIONS.map(condition => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition.id}
                      checked={localFilters.condition.includes(condition.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalFilters(prev => ({
                            ...prev,
                            condition: [...prev.condition, condition.id]
                          }));
                        } else {
                          setLocalFilters(prev => ({
                            ...prev,
                            condition: prev.condition.filter(c => c !== condition.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={condition.id} className="text-sm">
                      {condition.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Caractéristiques spéciales */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Caractéristiques spéciales
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Propriétés vérifiées uniquement</Label>
                  <Switch
                    checked={localFilters.verified}
                    onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, verified: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Avec photos</Label>
                  <Switch
                    checked={localFilters.hasImages}
                    onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, hasImages: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Avec visite virtuelle</Label>
                  <Switch
                    checked={localFilters.hasVirtualTour}
                    onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, hasVirtualTour: checked }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tri */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Trier par
              </Label>
              <Select
                value={localFilters.sortBy}
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un tri" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-background">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={applyFilters} className="flex-1">
              Appliquer ({getActiveFiltersCount()})
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedPropertyFilters;