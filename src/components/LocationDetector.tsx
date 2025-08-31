import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/contexts/LocationContext';
import { MapPin, Navigation, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllCountries, getAfricanCountries, isAfricanCountry } from '@/data/worldwideCountries';

export default function LocationDetector() {
  const {
    showLocationPrompt,
    selectedCountry,
    selectedCity,
    detectedCountry,
    detectedCity,
    setSelectedCountry,
    setSelectedCity,
    requestLocation,
    dismissLocationPrompt
  } = useLocation();

  const [isManualSelection, setIsManualSelection] = useState(false);

  if (!showLocationPrompt) return null;

  const allCountries = getAllCountries();
  const africanCountries = getAfricanCountries();
  const selectedCountryData = allCountries.find(c => c.name === selectedCountry);
  const availableCities = selectedCountryData?.cities || [];

  const handleLocationRequest = () => {
    requestLocation();
  };

  const handleManualSelection = () => {
    setIsManualSelection(true);
  };

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedCity(null);
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
  };

  const handleContinue = () => {
    if (selectedCountry && selectedCity) {
      dismissLocationPrompt();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Globe className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Bienvenue sur LaZone</h2>
            <p className="text-muted-foreground">
              Découvrez les meilleures propriétés près de chez vous
            </p>
          </div>

          {/* Detection Result */}
          {detectedCountry && detectedCity && !isManualSelection && (
            <div className="bg-success-light rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-success">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Position détectée</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedCountryData?.flag || '🌍'}
                </span>
                <p className="text-sm">
                  {detectedCity}, {detectedCountry}
                </p>
              </div>
              {!isAfricanCountry(detectedCountry) && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ℹ️ Vous pouvez chercher des propriétés depuis n'importe où, mais seuls les utilisateurs en Afrique peuvent créer des annonces.
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={dismissLocationPrompt}>
                  Utiliser cette position
                </Button>
                <Button size="sm" variant="outline" onClick={handleManualSelection}>
                  Choisir manuellement
                </Button>
              </div>
            </div>
          )}

          {/* Manual Selection or No Detection */}
          {(!detectedCountry || isManualSelection) && (
            <div className="space-y-4">
              {!isManualSelection && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Permettez-nous de détecter votre position pour vous proposer les biens les plus proches
                  </p>
                  
                  <Button 
                    onClick={handleLocationRequest}
                    className="w-full"
                    size="lg"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Détecter ma position
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleManualSelection}
                    className="w-full"
                    size="lg"
                  >
                    Choisir manuellement
                  </Button>
                </div>
              )}

              {isManualSelection && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pays</label>
                    <Select value={selectedCountry || ''} onValueChange={handleCountrySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCountries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{country.flag}</span>
                              <span>{country.name}</span>
                              {!country.isAfrican && <span className="text-xs text-muted-foreground">(recherche uniquement)</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCountry && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ville</label>
                      <Select value={selectedCity || ''} onValueChange={handleCitySelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre ville" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleContinue}
                      disabled={!selectedCountry || !selectedCity}
                      className="flex-1"
                    >
                      Continuer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsManualSelection(false)}
                    >
                      Retour
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skip Button */}
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={dismissLocationPrompt}
              className="text-muted-foreground"
            >
              Ignorer pour le moment
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}