import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user's favorites
  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Use mock data since favorites table doesn't exist
      const mockFavorites: Favorite[] = [
        {
          id: '1',
          user_id: user.id,
          listing_id: 'listing1',
          created_at: new Date().toISOString()
        }
      ];

      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async (listingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Connexion requise',
          description: 'Vous devez être connecté pour ajouter aux favoris.',
          variant: 'destructive',
        });
        return false;
      }

      // Mock add to favorites - update local state
      const newFavorite: Favorite = {
        id: Math.random().toString(36),
        user_id: user.id,
        listing_id: listingId,
        created_at: new Date().toISOString()
      };

      setFavorites(prev => [newFavorite, ...prev]);

      toast({
        title: 'Ajouté aux favoris',
        description: 'L\'annonce a été ajoutée à vos favoris.',
      });

      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter aux favoris.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (listingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Mock remove from favorites - update local state
      setFavorites(prev => prev.filter(fav => fav.listing_id !== listingId));

      toast({
        title: 'Retiré des favoris',
        description: 'L\'annonce a été retirée de vos favoris.',
      });

      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer des favoris.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Check if listing is in favorites
  const isFavorite = (listingId: string) => {
    return favorites.some(fav => fav.listing_id === listingId);
  };

  // Toggle favorite status
  const toggleFavorite = async (listingId: string) => {
    if (isFavorite(listingId)) {
      return await removeFromFavorites(listingId);
    } else {
      return await addToFavorites(listingId);
    }
  };

  useEffect(() => {
    fetchFavorites();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchFavorites();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    fetchFavorites,
  };
};