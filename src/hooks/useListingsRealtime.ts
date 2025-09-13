import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useListingsRealtime(
  countryCode: string, 
  onUpsert: (row: any) => void, 
  onRemove: (id: string) => void
) {
  useEffect(() => {
    const channel = supabase.channel(`realtime_listings_${countryCode}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'listings' 
        },
        (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          
          console.log('Realtime event:', payload.eventType, payload);
          
          // Filtrer côté client (plus robuste si le filtre serveur est capricieux)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (newRow?.country_code === countryCode && newRow?.status === 'active') {
              onUpsert(newRow);
            } else if (payload.eventType === 'UPDATE') {
              // Si ça sort du filtre (pays changé / status != active), on l'enlève
              onRemove(newRow.id);
            }
          }
          
          if (payload.eventType === 'DELETE') {
            onRemove(oldRow?.id);
          }
        }
      )
      .subscribe();

    console.log(`Subscribed to realtime updates for country: ${countryCode}`);

    return () => { 
      console.log(`Unsubscribing from realtime updates for country: ${countryCode}`);
      supabase.removeChannel(channel); 
    };
  }, [countryCode, onUpsert, onRemove]);
}

// Hook alternatif pour écouter toutes les annonces (sans filtre pays)
export function useAllListingsRealtime(
  onUpsert: (row: any) => void, 
  onRemove: (id: string) => void
) {
  useEffect(() => {
    const channel = supabase.channel('realtime_all_listings')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'listings' 
        },
        (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          
          console.log('Realtime event (all):', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (newRow?.status === 'active') {
              onUpsert(newRow);
            } else if (payload.eventType === 'UPDATE') {
              // Si le statut n'est plus active, on l'enlève
              onRemove(newRow.id);
            }
          }
          
          if (payload.eventType === 'DELETE') {
            onRemove(oldRow?.id);
          }
        }
      )
      .subscribe();

    console.log('Subscribed to realtime updates for all listings');

    return () => { 
      console.log('Unsubscribing from realtime updates for all listings');
      supabase.removeChannel(channel); 
    };
  }, [onUpsert, onRemove]);
}