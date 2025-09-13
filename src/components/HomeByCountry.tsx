import { useEffect, useState, useCallback } from 'react';
import { fetchListingsByCountry } from '@/utils/fetchListingsByCountry';
import ListingsMapbox from '@/components/ListingsMapbox';
import { useListingsRealtime } from '@/hooks/useListingsRealtime';

type Listing = {
  id: string; 
  title: string; 
  price: number | null; 
  neighborhood: string | null;
  created_at: string; 
  country_code: string; 
  latitude: number | null; 
  longitude: number | null; 
  city_id: string | null;
  images?: string[] | null;
  cities?: { name: string; slug: string } | null;
};

export default function HomeByCountry({ countryCode }: { countryCode: string }) {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchListingsByCountry(countryCode);
      setItems(data);
    } catch (e) {
      console.error('Fetch listings error', e);
    }
    setLoading(false);
  }, [countryCode]);

  useEffect(() => { 
    load(); 
  }, [load]);

  // Realtime upserts/removals
  useListingsRealtime(
    countryCode,
    (row) => {
      setItems(prev => {
        // Supprimer l'ancien et ajouter le nouveau en premier
        const withoutOld = prev.filter(p => p.id !== row.id);
        return [{ ...row }, ...withoutOld];
      });
    },
    (id) => {
      setItems(prev => prev.filter(p => p.id !== id));
    }
  );

  const countryNames: Record<string, string> = {
    'CI': 'Côte d\'Ivoire',
    'SN': 'Sénégal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'CM': 'Cameroun'
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Chargement des annonces pour {countryNames[countryCode] || countryCode}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* En-tête */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Annonces en {countryNames[countryCode] || countryCode}
        </h1>
        <p className="text-muted-foreground">
          {items.length} annonce{items.length > 1 ? 's' : ''} disponible{items.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Carte */}
      <div className="mb-6">
        <ListingsMapbox listings={items} />
      </div>

      {/* Liste des annonces */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(listing => (
            <div key={listing.id} className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
              {/* Image de l'annonce */}
              <div className="aspect-[16/10] overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={typeof listing.images === 'string' ? listing.images : listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback vers une image par défaut si l'image ne charge pas
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop&crop=center&auto=format';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Aucune image</span>
                  </div>
                )}
              </div>
              
              {/* Contenu de l'annonce */}
              <div className="p-4">
                <h3 className="text-base font-semibold mb-2 line-clamp-2">
                  {listing.title}
                </h3>
                
                {listing.price && (
                  <p className="text-primary font-bold text-lg mb-2">
                    {listing.price.toLocaleString()} FCFA
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground mb-3">
                  {listing.cities?.name}
                  {listing.neighborhood && ` • ${listing.neighborhood}`}
                  {` • ${countryCode}`}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {new Date(listing.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-2">
            Aucune annonce trouvée
          </p>
          <p className="text-sm text-muted-foreground">
            Soyez le premier à publier une annonce en {countryNames[countryCode] || countryCode} !
          </p>
        </div>
      )}
    </div>
  );
}