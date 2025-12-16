import { Search, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface SearchBarProps {
  variant?: 'default' | 'hero';
}

export const SearchBar = ({ variant = 'default' }: SearchBarProps) => {
  const { searchQuery, setSearchQuery } = useAppStore();

  const isHero = variant === 'hero';

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
      <button className="gradient-primary p-2 rounded-xl active:scale-95 transition-transform">
        <SlidersHorizontal className="w-4 h-4 text-primary-foreground" />
      </button>
    </div>
  );
};
