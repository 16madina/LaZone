import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Country {
  name: string;
  code: string;
  phoneCode: string;
  flag: string;
}

interface CountryPhoneSelectorProps {
  countries: Country[];
  selectedCountry: string | null;
  phoneNumber: string;
  onCountryChange: (country: string) => void;
  onPhoneChange: (phone: string) => void;
  placeholder?: string;
  label?: string;
}

const CountryPhoneSelector: React.FC<CountryPhoneSelectorProps> = ({
  countries,
  selectedCountry,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  placeholder = "XX XX XX XX",
  label = "Numéro de téléphone"
}) => {
  const currentCountry = countries.find(c => c.name === selectedCountry);

  return (
    <div className="space-y-2">
      <Label htmlFor="phone-input">{label}</Label>
      <div className="flex space-x-2">
        {/* Country Selector */}
        <Select value={selectedCountry || ''} onValueChange={onCountryChange}>
          <SelectTrigger className="w-32">
            <SelectValue>
              {currentCountry ? (
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{currentCountry.flag}</span>
                  <span className="text-sm font-medium">{currentCountry.phoneCode}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Pays</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.name}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.phoneCode}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Phone Number Input */}
        <Input
          id="phone-input"
          type="tel"
          placeholder={placeholder}
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="flex-1"
        />
      </div>
      
      {currentCountry && (
        <div className="text-sm text-muted-foreground">
          Numéro complet: {currentCountry.phoneCode} {phoneNumber}
        </div>
      )}
    </div>
  );
};

export default CountryPhoneSelector;