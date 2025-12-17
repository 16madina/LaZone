import { useState, useEffect } from 'react';
import { Loader2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/home/SearchBar';
import { FilterChips } from '@/components/home/FilterChips';
import { SponsoredPropertiesSection } from '@/components/home/SponsoredPropertiesSection';
import { PropertyCard } from '@/components/property/PropertyCard';
import { CountrySelector } from '@/components/home/CountrySelector';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { AdBanner } from '@/components/home/AdBanner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SectionTutorialButton from '@/components/tutorial/SectionTutorialButton';
import { useAppStore } from '@/stores/appStore';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/hooks/useAuth';
import { useGeoCountry } from '@/hooks/useGeoCountry';
import { supabase } from '@/integrations/supabase/client';
import { africanCountries, Country } from '@/data/africanCountries';
import logoLazone from '@/assets/logo-lazone.png';
import heroBg1 from '@/assets/hero-bg.jpg';
import heroBg2 from '@/assets/hero-bg-2.jpg';
import heroBg3 from '@/assets/hero-bg-3.jpg';
import heroBg4 from '@/assets/hero-bg-4.jpg';

const heroImages = [heroBg1, heroBg2, heroBg3, heroBg4];

interface AdBannerData {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
}

const Index = () => {
  const { activeFilter, searchQuery, priceRange, bedroomsFilter, bathroomsFilter, setBedroomsFilter, setBathroomsFilter } = useAppStore();
  const { properties, loading } = useProperties();
  const { profile, user } = useAuth();
  const { detectedCountry, permissionDenied, showAllCountries } = useGeoCountry();
  const [currentBg, setCurrentBg] = useState(heroBg1);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showGeoAlert, setShowGeoAlert] = useState(false);
  const [adBanners, setAdBanners] = useState<AdBannerData[]>([]);

  // Fetch ad banners
  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('ad_banners')
        .select('id, title, image_url, link_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data) {
        setAdBanners(data);
      }
    };
    fetchBanners();
  }, []);

  // Initialize country: logged-in users get their profile country, others get geolocation
  useEffect(() => {
    if (user && profile?.country) {
      // Logged-in user: use profile country
      const userCountry = africanCountries.find(c => c.code === profile.country);
      if (userCountry) {
        setSelectedCountry(userCountry);
      }
    } else if (!user) {
      if (detectedCountry) {
        // Not logged in: use geolocation-detected country
        setSelectedCountry(detectedCountry);
      } else if (showAllCountries) {
        // Geolocation denied or not in Africa - show all countries
        setSelectedCountry(null);
        if (permissionDenied) {
          setShowGeoAlert(true);
        }
      }
    }
  }, [user, profile?.country, detectedCountry, showAllCountries, permissionDenied]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    setCurrentBg(heroImages[randomIndex]);
  }, []);

  const filteredProperties = properties.filter((property) => {
    // Filter by country first (if a country is selected)
    if (selectedCountry && property.country !== selectedCountry.code) {
      return false;
    }

    // Filter by price range
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false;
    }

    // Filter by bedrooms
    if (bedroomsFilter !== null && (property.bedrooms ?? 0) < bedroomsFilter) {
      return false;
    }

    // Filter by bathrooms
    if (bathroomsFilter !== null && (property.bathrooms ?? 0) < bathroomsFilter) {
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

  // Insert banners after every 4 properties
  const renderPropertiesWithBanners = () => {
    const items: JSX.Element[] = [];
    let bannerIndex = 0;

    filteredProperties.forEach((property, index) => {
      items.push(
        <PropertyCard 
          key={property.id} 
          property={property} 
          userCountry={selectedCountry?.code}
          isFirst={index === 0}
        />
      );

      // After every 4 properties, insert a banner (if available)
      if ((index + 1) % 4 === 0 && adBanners.length > 0) {
        const banner = adBanners[bannerIndex % adBanners.length];
        items.push(
          <AdBanner 
            key={`banner-${banner.id}-${index}`}
            bannerId={banner.id}
            imageUrl={banner.image_url}
            linkUrl={banner.link_url}
            title={banner.title}
          />
        );
        bannerIndex++;
      }
    });

    return items;
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Geolocation Alert */}
      {showGeoAlert && !user && (
        <Alert className="mx-4 mt-4 bg-primary/10 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Localisation non disponible. Les annonces de tous les pays africains sont affichées. 
            <Link to="/auth" className="text-primary font-medium ml-1 underline">
              Inscrivez-vous
            </Link> pour choisir votre pays.
          </AlertDescription>
        </Alert>
      )}

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
            <img src={logoLazone} alt="LaZone" className="h-10" />
            <div className="flex items-center gap-3">
              <CountrySelector 
                selectedCountry={selectedCountry} 
                onCountryChange={setSelectedCountry}
                isAuthenticated={!!user}
              />
              <NotificationDropdown variant="hero" />
              <ProfileDropdown variant="hero" />
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
          <SearchBar variant="hero" selectedCountry={selectedCountry?.code} />

          {/* Filter Chips */}
          <div className="mt-4">
            <FilterChips variant="hero" />
          </div>

          {/* Sponsored Properties */}
          <div className="mt-6">
            <SponsoredPropertiesSection userCountry={selectedCountry?.code} />
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
                : 'Toutes les propriétés'}
            </h3>
            <button 
              onClick={() => {
                // Reset all filters to show all properties
                useAppStore.getState().setActiveFilter('all');
                useAppStore.getState().setSearchQuery('');
                useAppStore.getState().setPriceRange([0, 1000000000]);
                useAppStore.getState().setBedroomsFilter(null);
                useAppStore.getState().setBathroomsFilter(null);
              }}
              className="text-sm text-primary font-medium active:scale-95 transition-transform"
            >
              Voir tout
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {renderPropertiesWithBanners()}
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

      <SectionTutorialButton section="home" />
    </div>
  );
};

export default Index;
