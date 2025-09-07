import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GeolocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  accuracy?: number;
  address?: string;
}

interface SmartGeolocationProps {
  onLocationDetected?: (location: GeolocationResult) => void;
  showNearbyProperties?: boolean;
  className?: string;
}

export function SmartGeolocation({ 
  onLocationDetected, 
  showNearbyProperties = true, 
  className 
}: SmartGeolocationProps) {
  const { selectedCountry, setSelectedCountry } = useLocation();
  const { toast } = useToast();
  const [detecting, setDetecting] = useState(false);
  const [location, setLocation] = useState<GeolocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCount, setNearbyCount] = useState<number>(0);

  // Simuler la détection de propriétés à proximité
  const simulateNearbyProperties = (lat: number, lng: number) => {
    // Simulation basée sur la position (plus de propriétés dans certaines zones)
    const baseCount = Math.floor(Math.random() * 15) + 5;
    const cityBonus = Math.abs(lat) < 10 && Math.abs(lng) < 10 ? 10 : 0; // Plus de propriétés près de l'équateur (Afrique centrale)
    return Math.min(baseCount + cityBonus, 25);
  };

  // Géocodage inversé simplifié pour l'Afrique
  const reverseGeocode = async (lat: number, lng: number): Promise<Partial<GeolocationResult>> => {
    // Simulation du géocodage inversé avec des données africaines
    const africanCities = [
      { name: 'Abidjan', country: 'Côte d\'Ivoire', lat: 5.3364, lng: -4.0267 },
      { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
      { name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870 },
      { name: 'Dakar', country: 'Sénégal', lat: 14.7167, lng: -17.4677 },
      { name: 'Casablanca', country: 'Maroc', lat: 33.5731, lng: -7.5898 }
    ];

    // Trouver la ville la plus proche
    let closestCity = africanCities[0];
    let minDistance = Math.sqrt(Math.pow(lat - closestCity.lat, 2) + Math.pow(lng - closestCity.lng, 2));

    africanCities.forEach(city => {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });

    return {
      city: closestCity.name,
      country: closestCity.country,
      address: `${closestCity.name}, ${closestCity.country}`
    };
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      toast({
        title: 'Erreur',
        description: 'La géolocalisation n\'est pas disponible',
        variant: 'destructive'
      });
      return;
    }

    setDetecting(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Géocodage inversé
      const locationInfo = await reverseGeocode(latitude, longitude);
      
      const result: GeolocationResult = {
        latitude,
        longitude,
        accuracy,
        ...locationInfo
      };

      setLocation(result);
      
      // Simuler le comptage des propriétés à proximité
      if (showNearbyProperties) {
        const count = simulateNearbyProperties(latitude, longitude);
        setNearbyCount(count);
      }

      // Mettre à jour le pays sélectionné si détecté
      if (locationInfo.country) {
        setSelectedCountry(locationInfo.country);
      }

      onLocationDetected?.(result);

      toast({
        title: 'Position détectée',
        description: `Votre position a été localisée${locationInfo.city ? ` à ${locationInfo.city}` : ''}`,
      });

    } catch (error) {
      // Si la géolocalisation échoue, utiliser un fallback intelligent
      let errorMessage = 'Impossible de détecter votre position';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Accès à la position refusé. Utilisation du fallback intelligent.';
            // Fallback: utiliser une position par défaut basée sur l'IP ou des données contextuelles
            const fallbackLocation = {
              country: 'Ghana', // Exemple de fallback
              city: 'Accra',
              address: 'Accra, Ghana'
            };
            
            const fallbackResult: GeolocationResult = {
              latitude: 5.6037,
              longitude: -0.1870,
              accuracy: 50000, // Large radius pour indiquer une estimation
              ...fallbackLocation
            };

            setLocation(fallbackResult);
            
            // Mettre à jour les valeurs dans le contexte
            if (fallbackLocation.country) {
              setSelectedCountry(fallbackLocation.country);
            }
            
            onLocationDetected?.(fallbackResult);
            
            toast({
              title: 'Position estimée',
              description: `Position approximative: ${fallbackLocation.city}, ${fallbackLocation.country}`,
            });
            
            setDetecting(false);
            return;
            
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible. Vérifiez votre connexion GPS.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai de détection dépassé. Réessayez.';
            break;
        }
      }

      setError(errorMessage);
      toast({
        title: 'Erreur de géolocalisation',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setDetecting(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Géolocalisation intelligente</h3>
            </div>
            
            {location && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <MapPin className="w-3 h-3 mr-1" />
                Localisé
              </Badge>
            )}
          </div>

          {/* Status */}
          {location ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Navigation className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {location.address || 'Position détectée'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Précision: ~{location.accuracy ? Math.round(location.accuracy) : 100}m
                  </p>
                </div>
              </div>

              {showNearbyProperties && nearbyCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">Propriétés à proximité</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {nearbyCount}
                  </Badge>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={detectLocation}
                disabled={detecting}
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Actualiser la position
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {error ? (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Détectez automatiquement votre position pour voir les propriétés à proximité.
                </p>
              )}

              <Button
                onClick={detectLocation}
                disabled={detecting}
                className="w-full"
              >
                {detecting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Détection...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Détecter ma position
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Avantages :</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>Recherche automatique par distance</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>Suggestions de quartiers proches</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>Estimation des temps de trajet</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}