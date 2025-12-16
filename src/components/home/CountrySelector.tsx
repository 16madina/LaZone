import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { africanCountries, Country } from '@/data/africanCountries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onCountryChange: (country: Country) => void;
}

export const CountrySelector = ({ selectedCountry, onCountryChange }: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
      >
        <span className="text-xl">{selectedCountry?.flag || '🌍'}</span>
        <ChevronDown className="w-4 h-4 text-white" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Choisir un pays</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-1">
              {africanCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    selectedCountry?.code === country.code
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="flex-1 text-left font-medium">{country.name}</span>
                  {selectedCountry?.code === country.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
