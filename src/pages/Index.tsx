import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { SearchBar } from '@/components/home/SearchBar';
import { FilterChips } from '@/components/home/FilterChips';
import { StatsSection } from '@/components/home/StatsSection';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useAppStore } from '@/stores/appStore';

const Index = () => {
  const { properties, activeFilter, searchQuery } = useAppStore();

  const filteredProperties = properties.filter((property) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !property.title.toLowerCase().includes(query) &&
        !property.city.toLowerCase().includes(query) &&
        !property.address.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Filter by type
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sale') return property.type === 'sale';
    if (activeFilter === 'rent') return property.type === 'rent';
    if (activeFilter === 'house') return property.propertyType === 'house';
    if (activeFilter === 'apartment') return property.propertyType === 'apartment';
    if (activeFilter === 'land') return property.propertyType === 'land';
    if (activeFilter === 'commercial') return property.propertyType === 'commercial';
    return true;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-muted-foreground text-sm">Bonjour 👋</p>
          <h2 className="font-display text-xl font-bold">Bienvenue</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="icon-button relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 gradient-primary rounded-full" />
        </motion.button>
      </motion.header>

      {/* Hero Section */}
      <HeroSection />

      {/* Search Bar */}
      <SearchBar />

      {/* Filter Chips */}
      <FilterChips />

      {/* Stats Section */}
      <div className="mb-6">
        <StatsSection />
      </div>

      {/* Properties Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Propriétés récentes</h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="text-sm text-primary font-medium"
          >
            Voir tout
          </motion.button>
        </div>

        <div className="grid gap-4">
          {filteredProperties.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-muted-foreground">Aucune propriété trouvée</p>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
};

export default Index;
