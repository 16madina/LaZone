import { useState, useEffect } from 'react';
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
import { getCurrencyByCountry } from '@/data/currencies';

interface SearchBarProps {
  variant?: 'default' | 'hero';
  selectedCountry?: string | null;
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

const bedroomOptions = [
  { value: null, label: 'Tous' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

const bathroomOptions = [
  { value: null, label: 'Tous' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
];

const MAX_PRICE = 1000000000; // 1 milliard

const formatPriceLabel = (value: number, currencySymbol: string) => {
  if (value >= 1000000000) return `1B+ ${currencySymbol}`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M ${currencySymbol}`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ${currencySymbol}`;
  return `${value} ${currencySymbol}`;
};

export const SearchBar = ({ variant = 'default', selectedCountry }: SearchBarProps) => {
  const { 
    searchQuery, setSearchQuery, 
    activeFilter, setActiveFilter, 
    priceRange, setPriceRange,
    bedroomsFilter, setBedroomsFilter,
    bathroomsFilter, setBathroomsFilter
  } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState('all');
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);
  const [localBedrooms, setLocalBedrooms] = useState<number | null>(bedroomsFilter);
  const [localBathrooms, setLocalBathrooms] = useState<number | null>(bathroomsFilter);

  const isHero = variant === 'hero';
  const currency = getCurrencyByCountry(selectedCountry ?? null);
  const currencySymbol = currency?.symbol || 'FCFA';

  // Sync local state with store
  useEffect(() => {
    setLocalPriceRange(priceRange);
    setLocalBedrooms(bedroomsFilter);
    setLocalBathrooms(bathroomsFilter);
  }, [priceRange, bedroomsFilter, bathroomsFilter]);

  // Calculate number of active filters
  const activeFiltersCount = [
    activeFilter !== 'all',
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE,
    bedroomsFilter !== null,
    bathroomsFilter !== null,
  ].filter(Boolean).length;

  const applyFilters = () => {
    // Combine filters - prioritize transaction type, then property type
    if (selectedTransaction !== 'all') {
      setActiveFilter(selectedTransaction);
    } else if (selectedType !== 'all') {
      setActiveFilter(selectedType);
    } else {
      setActiveFilter('all');
    }
    setPriceRange(localPriceRange);
    setBedroomsFilter(localBedrooms);
    setBathroomsFilter(localBathrooms);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedTransaction('all');
    setLocalPriceRange([0, MAX_PRICE]);
    setLocalBedrooms(null);
    setLocalBathrooms(null);
    setActiveFilter('all');
    setPriceRange([0, MAX_PRICE]);
    setBedroomsFilter(null);
    setBathroomsFilter(null);
    setSearchQuery('');
  };

  return (
    <div 
      data-tutorial="search"
      className={`flex items-center gap-3 p-3 rounded-2xl ${
        isHero 
          ? 'bg-white/95 backdrop-blur-sm shadow-lg' 
          : 'search-bar'
      }`}
    >
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
          <button className="relative gradient-primary p-2 rounded-xl active:scale-95 transition-transform">
            <SlidersHorizontal className="w-4 h-4 text-primary-foreground" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-white text-primary rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                {activeFiltersCount}
              </span>
            )}
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

            {/* Price Range */}
            <div>
              <h4 className="font-medium mb-3">Fourchette de prix</h4>
              <div className="px-2">
                <Slider
                  value={[localPriceRange[0], localPriceRange[1]]}
                  onValueChange={(value) => setLocalPriceRange([value[0], value[1]])}
                  max={MAX_PRICE}
                  min={0}
                  step={1000000}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatPriceLabel(localPriceRange[0], currencySymbol)}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatPriceLabel(localPriceRange[1], currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <h4 className="font-medium mb-3">Chambres</h4>
              <div className="flex flex-wrap gap-2">
                {bedroomOptions.map((option) => (
                  <button
                    key={option.value ?? 'all'}
                    onClick={() => setLocalBedrooms(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      localBedrooms === option.value
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <h4 className="font-medium mb-3">Salles de bain</h4>
              <div className="flex flex-wrap gap-2">
                {bathroomOptions.map((option) => (
                  <button
                    key={option.value ?? 'all'}
                    onClick={() => setLocalBathrooms(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      localBathrooms === option.value
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {option.label}
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
