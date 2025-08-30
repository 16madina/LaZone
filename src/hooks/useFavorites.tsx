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

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      setFavorites(data || []);
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

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          listing_id: listingId,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Déjà en favoris',
            description: 'Cette annonce est déjà dans vos favoris.',
          });
          return false;
        }
        throw error;
      }

      toast({
        title: 'Ajouté aux favoris',
        description: 'L\'annonce a été ajoutée à vos favoris.',
      });

      fetchFavorites(); // Refresh favorites
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

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Retiré des favoris',
        description: 'L\'annonce a été retirée de vos favoris.',
      });

      fetchFavorites(); // Refresh favorites
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