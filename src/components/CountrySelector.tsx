import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/contexts/LocationContext';
import { MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const AFRICAN_COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', cities: ['Abidjan', 'Bouaké', 'Daloa'] },
  { code: 'SN', name: 'Sénégal', cities: ['Dakar', 'Thiès', 'Kaolack'] },
  { code: 'NG', name: 'Nigeria', cities: ['Lagos', 'Kano', 'Ibadan', 'Port Harcourt'] },
  { code: 'GH', name: 'Ghana', cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi'] },
  { code: 'CM', name: 'Cameroun', cities: ['Douala', 'Yaoundé', 'Garoua', 'Bamenda'] },
  { code: 'KE', name: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'] },
  { code: 'MA', name: 'Maroc', cities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès'] },
  { code: 'TN', name: 'Tunisie', cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan'] },
  { code: 'EG', name: 'Égypte', cities: ['Le Caire', 'Alexandrie', 'Giza', 'Louxor'] },
  { code: 'ZA', name: 'Afrique du Sud', cities: ['Johannesburg', 'Le Cap', 'Durban', 'Pretoria'] },
  { code: 'ET', name: 'Éthiopie', cities: ['Addis-Abeba', 'Dire Dawa', 'Mekelle', 'Gondar'] },
  { code: 'TG', name: 'Togo', cities: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé'] },
  { code: 'BJ', name: 'Bénin', cities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey'] }
];

interface CountrySelectorProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function CountrySelector({ className, variant = 'default' }: CountrySelectorProps) {
  const { selectedCountry, setSelectedCountry, currency } = useLocation();

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <MapPin className="w-4 h-4 text-primary" />
        <Select value={selectedCountry || ''} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-auto h-8 border-0 bg-transparent hover:bg-accent focus:ring-0 focus:ring-offset-0">
            <div className="flex items-center gap-1">
              <SelectValue placeholder="Pays" />
              <ChevronDown className="w-3 h-3" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {AFRICAN_COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.name}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-card rounded-lg border", className)}>
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">Pays :</span>
      </div>
      
      <Select value={selectedCountry || ''} onValueChange={handleCountryChange}>
        <SelectTrigger className="min-w-[200px]">
          <SelectValue placeholder="Sélectionnez un pays" />
        </SelectTrigger>
        <SelectContent>
          {AFRICAN_COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.name}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCountry && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Devise:</span>
          <span className="font-medium">{currency}</span>
        </div>
      )}
    </div>
  );
}