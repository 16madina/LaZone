import { useState } from 'react';
import { ChevronDown, Check, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { africanCountries, Country } from '@/data/africanCountries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onCountryChange: (country: Country) => void;
  isAuthenticated?: boolean;
}

export const CountrySelector = ({ selectedCountry, onCountryChange, isAuthenticated = true }: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        data-tutorial="country"
        className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
      >
        {selectedCountry ? (
          <img 
            src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
            alt={selectedCountry.name}
            className="w-6 h-4 rounded object-cover"
          />
        ) : (
          <span className="text-xl">🌍</span>
        )}
        <ChevronDown className="w-4 h-4 text-white" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {isAuthenticated ? 'Choisir un pays' : 'Connexion requise'}
            </DialogTitle>
            {!isAuthenticated && (
              <DialogDescription>
                Inscrivez-vous ou connectez-vous pour choisir manuellement un pays et accéder à toutes les fonctionnalités.
              </DialogDescription>
            )}
          </DialogHeader>
          
          {isAuthenticated ? (
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
                    <img 
                      src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                      alt={country.name}
                      className="w-8 h-6 rounded object-cover"
                    />
                    <span className="flex-1 text-left font-medium">{country.name}</span>
                    {selectedCountry?.code === country.code && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              <div className="text-center text-muted-foreground text-sm">
                Vous voyez actuellement les annonces de {selectedCountry?.name || 'votre localisation détectée'}.
              </div>
              <Button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/auth');
                }}
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter / S'inscrire
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
