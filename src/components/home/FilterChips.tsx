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

interface FilterChipsProps {
  variant?: 'default' | 'hero';
}

export const FilterChips = ({ variant = 'default' }: FilterChipsProps) => {
  const { activeFilter, setActiveFilter } = useAppStore();

  const isHero = variant === 'hero';

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              isActive 
                ? 'gradient-primary text-primary-foreground shadow-lg' 
                : isHero 
                  ? 'bg-white/90 backdrop-blur-sm text-foreground shadow-sm' 
                  : 'glass text-foreground'
            }`}
          >
            <span>{filter.emoji}</span>
            <span className="text-inherit">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};
