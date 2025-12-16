import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

const filters = [
  { id: 'all', label: 'Tout', emoji: '✨' },
  { id: 'sale', label: 'À vendre', emoji: '💰' },
  { id: 'rent', label: 'À louer', emoji: '🔑' },
  { id: 'house', label: 'Maisons', emoji: '🏠' },
  { id: 'apartment', label: 'Apparts', emoji: '🏢' },
  { id: 'land', label: 'Terrains', emoji: '🌳' },
  { id: 'commercial', label: 'Commerces', emoji: '🏪' },
];

export const FilterChips = () => {
  const { activeFilter, setActiveFilter } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <motion.button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              isActive 
                ? 'gradient-primary text-primary-foreground shadow-lg' 
                : 'glass text-foreground hover:scale-[1.02]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <span>{filter.emoji}</span>
            <span className="text-inherit">{filter.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
