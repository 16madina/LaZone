import { Search, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <div className="search-bar">
      <Search className="w-5 h-5 text-muted-foreground" />
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
