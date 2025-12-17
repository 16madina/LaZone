import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface SearchBarProps {
  variant?: 'default' | 'hero';
}

const propertyTypes = [
  { value: 'all', label: 'Tous' },
  { value: 'house', label: '🏠 Maison' },
  { value: 'apartment', label: '🏢 Appartement' },
  { value: 'land', label: '🌳 Terrain' },
  { value: 'commercial', label: '🏪 Commercial' },
];

const transactionTypes = [
  { value: 'all', label: 'Tous' },
  { value: 'sale', label: 'À vendre' },
  { value: 'rent', label: 'À louer' },
];

export const SearchBar = ({ variant = 'default' }: SearchBarProps) => {
  const { searchQuery, setSearchQuery, activeFilter, setActiveFilter } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500000000]);

  const isHero = variant === 'hero';

  const applyFilters = () => {
    // Combine filters - prioritize transaction type, then property type
    if (selectedTransaction !== 'all') {
      setActiveFilter(selectedTransaction);
    } else if (selectedType !== 'all') {
      setActiveFilter(selectedType);
    } else {
      setActiveFilter('all');
    }
    setIsOpen(false);
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedTransaction('all');
    setPriceRange([0, 500000000]);
    setActiveFilter('all');
    setSearchQuery('');
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl ${
      isHero 
        ? 'bg-white/95 backdrop-blur-sm shadow-lg' 
        : 'search-bar'
    }`}>
      <Search className={`w-5 h-5 ${isHero ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
      <input
        type="text"
        placeholder="Rechercher une ville, un quartier..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="gradient-primary p-2 rounded-xl active:scale-95 transition-transform">
            <SlidersHorizontal className="w-4 h-4 text-primary-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Transaction Type */}
            <div>
              <h4 className="font-medium mb-3">Type de transaction</h4>
              <div className="flex flex-wrap gap-2">
                {transactionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedTransaction(type.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTransaction === type.value
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h4 className="font-medium mb-3">Type de bien</h4>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedType === type.value
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
              <Button 
                className="flex-1 gradient-primary"
                onClick={applyFilters}
              >
                Appliquer
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
