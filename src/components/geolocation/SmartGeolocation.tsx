import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Target, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from '@/hooks/use-toast';

interface SmartGeolocationProps {
  onLocationSelect?: (location: {
    country?: string;
    city?: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }) => void;
  showRadius?: boolean;
  compact?: boolean;
}

const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' }
];

const POPULAR_LOCATIONS = [
  { country: 'Sénégal', city: 'Dakar', neighborhoods: ['Plateau', 'Almadies', 'Mermoz', 'Sacré-Cœur', 'Yoff'] },
  { country: 'Côte d\'Ivoire', city: 'Abidjan', neighborhoods: ['Cocody', 'Marcory', 'Plateau', 'Yopougon', 'Adjamé'] },
  { country: 'Mali', city: 'Bamako', neighborhoods: ['ACI 2000', 'Hippodrome', 'Hamdallaye', 'Badalabougou', 'Sogoniko'] },
  { country: 'Burkina Faso', city: 'Ouagadougou', neighborhoods: ['Zone du Bois', 'Ouaga 2000', 'Cissin', 'Tampouy', 'Saaba'] },
  { country: 'Cameroun', city: 'Douala', neighborhoods: ['Bonapriso', 'Bonanjo', 'Akwa', 'Deido', 'Makepe'] },
  { country: 'Cameroun', city: 'Yaoundé', neighborhoods: ['Centre-ville', 'Bastos', 'Mvan', 'Nlongkak', 'Emana'] }
];

const SmartGeolocation: React.FC<SmartGeolocationProps> = ({
  onLocationSelect,
  showRadius = false,
  compact = false
}) => {
  const { data, loading, error, getCurrentPosition, reset, countries } = useGeolocation();
  const [selectedRadius, setSelectedRadius] = useState(5000);
  const [manualLocation, setManualLocation] = useState({
    country: '',
    city: '',
    neighborhood: ''
  });
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    if (data && onLocationSelect) {
      onLocationSelect({
        ...data,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy
      });
    }
  }, [data, onLocationSelect]);

  useEffect(() => {
    if (manualLocation.country && manualLocation.city && onLocationSelect) {
      onLocationSelect(manualLocation);
    }
  }, [manualLocation, onLocationSelect]);

  const handleGetCurrentLocation = async () => {
    try {
      await getCurrentPosition();
      toast({
        title: "Localisation trouvée",
        description: "Votre position a été détectée avec succès."
      });
    } catch (err) {
      toast({
        title: "Erreur de localisation",
        description: "Impossible d'accéder à votre localisation.",
        variant: "destructive"
      });
    }
  };

  const handleQuickLocation = (location: typeof POPULAR_LOCATIONS[0], neighborhood: string) => {
    setManualLocation({
      country: location.country,
      city: location.city,
      neighborhood
    });
    setMode('manual');
  };

  const renderCompactView = () => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGetCurrentLocation}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        {data ? `${data.city}, ${data.country}` : 'Ma position'}
      </Button>
      
      <Select
        value={`${manualLocation.country}-${manualLocation.city}-${manualLocation.neighborhood}`}
        onValueChange={(value) => {
          const [country, city, neighborhood] = value.split('-');
          setManualLocation({ country, city, neighborhood });
          setMode('manual');
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Choisir un quartier" />
        </SelectTrigger>
        <SelectContent>
          {POPULAR_LOCATIONS.map(location => 
            location.neighborhoods.map(neighborhood => (
              <SelectItem 
                key={`${location.country}-${location.city}-${neighborhood}`}
                value={`${location.country}-${location.city}-${neighborhood}`}
              >
                {neighborhood}, {location.city}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );

  if (compact) return renderCompactView();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Localisation intelligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={mode === 'auto' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setMode('auto')}
          >
            <Target className="w-4 h-4 mr-2" />
            Auto
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setMode('manual')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Manuel
          </Button>
        </div>

        {mode === 'auto' ? (
          <div className="space-y-4">
            {/* Current location detection */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleGetCurrentLocation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Localisation en cours...' : 'Détecter ma position'}
              </Button>
              
              {data && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {data.city}, {data.country}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        ±{Math.round(data.accuracy || 0)}m
                      </Badge>
                    </div>
                    {data.city && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Ville détectée
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Radius selector for auto mode */}
            {showRadius && data && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rayon de recherche
                </label>
                <Select
                  value={selectedRadius.toString()}
                  onValueChange={(value) => setSelectedRadius(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rayon" />
                  </SelectTrigger>
                  <SelectContent>
                    {RADIUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick location buttons */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Localisation rapide
              </label>
              <div className="grid gap-2">
                {POPULAR_LOCATIONS.map(location => (
                  <div key={`${location.country}-${location.city}`}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {location.city}, {location.country}
                    </h4>
                    <div className="grid grid-cols-2 gap-1">
                      {location.neighborhoods.map(neighborhood => (
                        <Button
                          key={neighborhood}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleQuickLocation(location, neighborhood)}
                        >
                          {neighborhood}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual selection */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Pays</label>
                <Select
                  value={manualLocation.country}
                  onValueChange={(value) => setManualLocation(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ville</label>
                <Select
                  value={manualLocation.city}
                  onValueChange={(value) => setManualLocation(prev => ({ ...prev, city: value }))}
                  disabled={!manualLocation.country}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_LOCATIONS
                      .filter(loc => loc.country === manualLocation.country)
                      .map(loc => (
                        <SelectItem key={loc.city} value={loc.city}>
                          {loc.city}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Quartier</label>
                <Select
                  value={manualLocation.neighborhood}
                  onValueChange={(value) => setManualLocation(prev => ({ ...prev, neighborhood: value }))}
                  disabled={!manualLocation.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un quartier" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_LOCATIONS
                      .find(loc => loc.city === manualLocation.city)
                      ?.neighborhoods.map(neighborhood => (
                        <SelectItem key={neighborhood} value={neighborhood}>
                          {neighborhood}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected manual location display */}
            {manualLocation.country && manualLocation.city && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {manualLocation.neighborhood && `${manualLocation.neighborhood}, `}
                      {manualLocation.city}, {manualLocation.country}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {(data || (manualLocation.country && manualLocation.city)) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reset}
            className="w-full"
          >
            Réinitialiser la localisation
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartGeolocation;