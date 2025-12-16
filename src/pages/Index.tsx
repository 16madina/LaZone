import { Bell, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/home/SearchBar';
import { FilterChips } from '@/components/home/FilterChips';
import { StatsSection } from '@/components/home/StatsSection';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useAppStore } from '@/stores/appStore';
import logoLazone from '@/assets/logo-lazone.png';
import heroBg from '@/assets/hero-bg.jpg';

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
    <div className="min-h-screen pb-24">
      {/* Hero Section with Background */}
      <div 
        className="relative px-4 pt-4 pb-6"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <img src={logoLazone} alt="LaZone" className="h-10" />
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              </button>
              <Link to="/profile" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
                <User className="w-5 h-5 text-white" />
              </Link>
            </div>
          </header>

          {/* Hero Text */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-sm text-white/80 font-medium">
                Découvrez votre futur chez-vous en Afrique
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Trouvez la propriété
              <br />
              <span className="text-white/90">de vos rêves</span>
            </h1>

            <p className="text-white/70 text-sm">
              Des milliers de propriétés disponibles en Afrique
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar variant="hero" />

          {/* Filter Chips */}
          <div className="mt-4">
            <FilterChips variant="hero" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-6">
        {/* Stats Section */}
        <div className="mb-6">
          <StatsSection />
        </div>

        {/* Properties Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Propriétés récentes</h3>
            <button className="text-sm text-primary font-medium active:scale-95 transition-transform">
              Voir tout
            </button>
          </div>

          <div className="grid gap-4">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-muted-foreground">Aucune propriété trouvée</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
