import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CountrySelector from "@/components/CountrySelector";

interface HeaderProps {
  searchMode: 'rent' | 'buy';
  onSearchModeChange: (mode: 'rent' | 'buy') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onFiltersToggle: () => void;
  showFilters: boolean;
}

export default function Header({ 
  searchMode, 
  onSearchModeChange, 
  searchQuery, 
  onSearchQueryChange,
  onFiltersToggle,
  showFilters 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-card backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        {/* Brand and Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            {/* Country Selector */}
            <CountrySelector variant="compact" />

            {/* Toggle Rent/Buy */}
            <div className="flex bg-secondary rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchModeChange('rent')}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all duration-normal",
                  searchMode === 'rent' 
                    ? "bg-primary text-primary-foreground shadow-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Louer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchModeChange('buy')}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all duration-normal",
                  searchMode === 'buy' 
                    ? "bg-primary text-primary-foreground shadow-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Acheter
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              FR
            </Button>
            <div className="w-px h-6 bg-border"></div>
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Ville, quartier ou adresse..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10 pr-4 py-3 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 focus:ring-1 focus:ring-primary/20 rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onFiltersToggle}
            className={cn(
              "px-4 py-3 border-border/60 rounded-xl transition-all duration-normal",
              showFilters && "bg-primary text-primary-foreground border-primary"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}