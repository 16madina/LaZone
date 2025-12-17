import { useState, useEffect } from 'react';
import { Bell, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/home/SearchBar';
import { FilterChips } from '@/components/home/FilterChips';
import { StatsSection } from '@/components/home/StatsSection';
import { PropertyCard } from '@/components/property/PropertyCard';
import { CountrySelector } from '@/components/home/CountrySelector';
import { useAppStore } from '@/stores/appStore';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { africanCountries, Country } from '@/data/africanCountries';
import logoLazone from '@/assets/logo-lazone.png';
import heroBg1 from '@/assets/hero-bg.jpg';
import heroBg2 from '@/assets/hero-bg-2.jpg';
import heroBg3 from '@/assets/hero-bg-3.jpg';
import heroBg4 from '@/assets/hero-bg-4.jpg';

const heroImages = [heroBg1, heroBg2, heroBg3, heroBg4];

const Index = () => {
  const { activeFilter, searchQuery } = useAppStore();
  const { properties, loading } = useProperties();
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [currentBg, setCurrentBg] = useState(heroBg1);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  // Initialize country from user profile
  useEffect(() => {
    if (profile?.country) {
      const userCountry = africanCountries.find(c => c.code === profile.country);
      if (userCountry) {
        setSelectedCountry(userCountry);
      }
    }
  }, [profile?.country]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    setCurrentBg(heroImages[randomIndex]);
  }, []);

  const filteredProperties = properties.filter((property) => {
    // Filter by country first
    if (selectedCountry && property.country !== selectedCountry.code) {
      return false;
    }

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
    <div className="min-h-screen pb-32">
      {/* Hero Section with Background */}
      <div 
        className="relative px-4 pt-4 pb-8"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <img src={logoLazone} alt="LaZone" className="h-14" />
            <div className="flex items-center gap-3">
              <CountrySelector 
                selectedCountry={selectedCountry} 
                onCountryChange={setSelectedCountry} 
              />
              <Link 
                to="/notifications"
                className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
                <User className="w-5 h-5 text-white" />
              </Link>
            </div>
          </header>

          {/* Hero Content with Logo */}
          <div className="text-center mb-8">
            <img src={logoLazone} alt="LaZone" className="h-24 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Trouvez votre chez vous
              <br />
              <span className="text-white/90">dans votre Zone</span>
            </h1>
            <p className="text-white/70 text-sm">
              {selectedCountry 
                ? `Propriétés disponibles en ${selectedCountry.name}` 
                : 'Des milliers de propriétés disponibles en Afrique'}
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar variant="hero" />

          {/* Filter Chips */}
          <div className="mt-4">
            <FilterChips variant="hero" />
          </div>

          {/* Stats Section */}
          <div className="mt-6">
            <StatsSection variant="hero" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-6">
        {/* Properties Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">
              {selectedCountry 
                ? `Propriétés en ${selectedCountry.name}` 
                : 'Propriétés récentes'}
            </h3>
            <button className="text-sm text-primary font-medium active:scale-95 transition-transform">
              Voir tout
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  userCountry={selectedCountry?.code}
                />
              ))}
            </div>
          )}

          {!loading && filteredProperties.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-muted-foreground">
                {selectedCountry 
                  ? `Aucune propriété trouvée en ${selectedCountry.name}` 
                  : 'Aucune propriété trouvée'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
