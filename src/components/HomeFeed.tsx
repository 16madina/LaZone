import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ListingsMap } from './ListingsMap';

type Listing = {
  id: string;
  title: string;
  price: number | null;
  neighborhood: string | null;
  created_at: string;
  country_code: string;
  city?: { name: string; slug: string } | null;
  latitude: number | null;
  longitude: number | null;
};

export function HomeFeed({ countryCode }: { countryCode: string }) {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFeed() {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, title, price, neighborhood, created_at, country_code, latitude, longitude,
        city:cities(name, slug)
      `)
      .eq('country_code', countryCode)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    }
    
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFeed();
  }, [countryCode]);

  // Realtime: nouvelles annonces publiées dans ce pays
  useEffect(() => {
    const channel = supabase.channel(`listings_${countryCode}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'listings', 
          filter: `country_code=eq.${countryCode}` 
        },
        payload => {
          const row = payload.new as any;
          if (['INSERT','UPDATE'].includes(payload.eventType) && row.status === 'active') {
            setItems(prev => {
              const without = prev.filter(x => x.id !== row.id);
              return [{ ...row }, ...without];
            });
          }
          if (payload.eventType === 'UPDATE' && (payload.new as any).status !== 'active') {
            setItems(prev => prev.filter(x => x.id !== (payload.new as any).id));
          }
        }
      ).subscribe();
    
    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [countryCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des annonces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carte des annonces */}
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <ListingsMap listings={items} />
      </div>

      {/* Liste des annonces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(listing => (
          <div key={listing.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
            
            {listing.price && (
              <p className="text-primary font-bold text-xl mb-2">
                {listing.price.toLocaleString()} FCFA
              </p>
            )}
            
            <div className="text-sm text-muted-foreground mb-3">
              {listing.city?.name}
              {listing.neighborhood && ` • ${listing.neighborhood}`}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {new Date(listing.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune annonce trouvée pour ce pays.</p>
        </div>
      )}
    </div>
  );
}