import { Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="search-bar"
    >
      <Search className="w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        placeholder="Rechercher une ville, un quartier..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="gradient-primary p-2 rounded-xl"
      >
        <SlidersHorizontal className="w-4 h-4 text-primary-foreground" />
      </motion.button>
    </motion.div>
  );
};
