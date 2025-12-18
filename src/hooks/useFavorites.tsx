import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from database
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data?.map((f) => f.property_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add favorite
  const addFavorite = async (propertyId: string) => {
    if (!user) {
      toast({ title: 'Connectez-vous pour ajouter aux favoris', variant: 'destructive' });
      return false;
    }

    // Optimistically update UI first
    setFavorites((prev) => [...prev, propertyId]);

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: propertyId });

      if (error) {
        // Revert on error
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
        console.error('Error adding favorite:', error);
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter aux favoris. Vérifiez votre connexion.', variant: 'destructive' });
        return false;
      }

      return true;
    } catch (error) {
      // Revert on error
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
      console.error('Error adding favorite:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter aux favoris. Vérifiez votre connexion.', variant: 'destructive' });
      return false;
    }
  };

  // Remove favorite
  const removeFavorite = async (propertyId: string) => {
    if (!user) return false;

    // Optimistically update UI first
    const previousFavorites = [...favorites];
    setFavorites((prev) => prev.filter((id) => id !== propertyId));

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        // Revert on error
        setFavorites(previousFavorites);
        console.error('Error removing favorite:', error);
        toast({ title: 'Erreur', description: 'Impossible de retirer des favoris', variant: 'destructive' });
        return false;
      }

      return true;
    } catch (error) {
      // Revert on error
      setFavorites(previousFavorites);
      console.error('Error removing favorite:', error);
      toast({ title: 'Erreur', description: 'Impossible de retirer des favoris', variant: 'destructive' });
      return false;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      return removeFavorite(propertyId);
    } else {
      return addFavorite(propertyId);
    }
  };

  // Check if property is favorite
  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  // Load favorites on mount and when user changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };
};
