import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Autocomplete } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";
import { Home, Building2, MapPin, Bed, Bath, Maximize, X, Search, Save, BookmarkPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
  created_at: string;
}

export interface FilterState {
  location: string;
  radius: number; // in km
  propertyType: string[];
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  areaRange: [number, number];
  amenities: string[];
  keyword: string;
}

interface SmartPropertyFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  searchMode: 'rent' | 'buy' | 'commercial';
}

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Appartement', icon: Building2 },
  { id: 'house', label: 'Maison', icon: Home },
  { id: 'villa', label: 'Villa', icon: Home },
  { id: 'land', label: 'Terrain', icon: MapPin },
  { id: 'commercial', label: 'Commercial', icon: Building2 },
  { id: 'office', label: 'Bureau', icon: Building2 }
];

const AMENITIES = [
  'Piscine', 'Parking', 'Meublé', 'Sécurité 24/7', 
  'Fibre optique', 'Climatisation', 'Ascenseur', 'Balcon',
  'Jardin', 'Vue mer', 'Neuf', 'Salle de sport',
  'Cuisine équipée', 'Terrasse', 'Cave', 'Garage',
  'Concierge', 'Buanderie', 'Cheminée', 'Dressing',
  'Bureau', 'Internet haut débit', 'Système d\'alarme',
  'Panneau solaire', 'Générateur', 'Eau courante'
];

const SENEGAL_CITIES = [
  'Dakar', 'Thiès', 'Kaolack', 'Ziguinchor', 'Saint-Louis',
  'Tambacounda', 'Diourbel', 'Louga', 'Fatick', 'Kolda',
  'Sédhiou', 'Kaffrine', 'Kédougou', 'Matam'
];

const DAKAR_NEIGHBORHOODS = [
  'Plateau', 'Médina', 'Point E', 'Mermoz', 'Sacré-Cœur',
  'Almadies', 'Ngor', 'Ouakam', 'Yoff', 'Parcelles Assainies',
  'Grand Dakar', 'Fann', 'Amitié', 'Liberté', 'HLM',
  'Dieuppeul', 'Derklé', 'Cambérène', 'Patte d\'Oie'
];

export default function SmartPropertyFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  searchMode 
}: SmartPropertyFiltersProps) {
  const { toast } = useToast();
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Auto-complete suggestions
  const locationSuggestions = useMemo(() => {
    const cities = SENEGAL_CITIES.map(city => ({ label: city, value: city, type: 'city' }));
    const neighborhoods = DAKAR_NEIGHBORHOODS.map(n => ({ 
      label: `${n}, Dakar`, 
      value: `${n}, Dakar`, 
      type: 'neighborhood' 
    }));
    return [...cities, ...neighborhoods];
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSavedPresets();
    }
  }, [isOpen]);

  const loadSavedPresets = () => {
    // Load from localStorage (in real app, would be from database)
    const saved = localStorage.getItem('filter_presets');
    if (saved) {
      setSavedPresets(JSON.parse(saved));
    }
  };

  const saveFilterPreset = () => {
    if (!presetName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un nom pour ce filtre',
        variant: 'destructive'
      });
      return;
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName,
      filters: { ...filters },
      created_at: new Date().toISOString()
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('filter_presets', JSON.stringify(updatedPresets));
    
    setPresetName('');
    setShowSavePreset(false);
    
    toast({
      title: 'Succès',
      description: 'Filtre sauvegardé avec succès'
    });
  };

  const loadFilterPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters);
    toast({
      title: 'Filtre chargé',
      description: `Filtre "${preset.name}" appliqué`
    });
  };

  const deleteFilterPreset = (presetId: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updatedPresets);
    localStorage.setItem('filter_presets', JSON.stringify(updatedPresets));
    
    toast({
      title: 'Filtre supprimé',
      description: 'Le filtre a été supprimé'
    });
  };

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

  const maxPrice = searchMode === 'rent' ? 2000000 : searchMode === 'buy' ? 50000000 : 5000000;
  const priceLabel = searchMode === 'rent' ? 'Loyer mensuel' : searchMode === 'buy' ? 'Prix d\'achat' : 'Loyer commercial';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gradient-card shadow-xl animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Filtres intelligents</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSavePreset(!showSavePreset)}
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Save Preset Section */}
          {showSavePreset && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex gap-2">
                <Input
                  placeholder="Nom du filtre..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={saveFilterPreset}>
                  <BookmarkPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium mb-2">Filtres sauvegardés</h3>
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((preset) => (
                  <Badge
                    key={preset.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => loadFilterPreset(preset)}
                  >
                    {preset.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
            {/* Smart Search */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Recherche intelligente
              </h3>
              <Input
                placeholder="Ex: Villa 4 chambres avec piscine..."
                value={filters.keyword}
                onChange={(e) => updateFilters({ keyword: e.target.value })}
                className="mb-3"
              />
            </div>

            {/* Location with Autocomplete */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation
              </h3>
              <Autocomplete
                placeholder="Ville ou quartier..."
                value={filters.location}
                onValueChange={(value) => updateFilters({ location: value })}
                suggestions={locationSuggestions}
                className="mb-3"
              />
              
              {/* Radius selector */}
              <div className="mt-3">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Rayon de recherche: {filters.radius} km
                </label>
                <Slider
                  value={[filters.radius]}
                  onValueChange={(value) => updateFilters({ radius: value[0] })}
                  max={50}
                  min={1}
                  step={1}
                  className="mb-2"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>1 km</span>
                  <span>50 km</span>
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
                        "flex flex-col items-center gap-1 h-auto py-2 text-xs transition-all duration-normal",
                        isSelected && "bg-primary text-primary-foreground border-primary"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
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
              <h3 className="text-sm font-medium mb-3">Commodités</h3>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => {
                  const isSelected = filters.amenities.includes(amenity);
                  return (
                    <Badge
                      key={amenity}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all duration-fast text-xs",
                        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      )}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Badge>
                  );
                })}
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
                    location: '',
                    radius: 10,
                    propertyType: [],
                    priceRange: [0, maxPrice],
                    bedrooms: 'any',
                    bathrooms: 'any',
                    areaRange: [20, 1000],
                    amenities: [],
                    keyword: ''
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