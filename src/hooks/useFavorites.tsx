import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppMode } from '@/hooks/useAppMode';
import { toast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { appMode } = useAppMode();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Determine listing type based on app mode
  const listingType = appMode === 'residence' ? 'short_term' : 'long_term';

  // Load favorites from database - filtered by listing_type
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      // Join with properties to filter by listing_type
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property_id,
          properties!inner (
            id,
            listing_type
          )
        `)
        .eq('user_id', user.id)
        .eq('properties.listing_type', listingType);

      if (error) throw error;

      setFavorites(data?.map((f) => f.property_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user, listingType]);

  // Add favorite with proper auth check
  const addFavorite = async (propertyId: string) => {
    // Wait for auth to be ready if still loading
    if (authLoading) {
      toast({ title: 'Chargement...', description: 'Veuillez patienter.' });
      return false;
    }

    // Check if user is authenticated
    if (!user) {
      toast({ 
        title: 'Connexion requise', 
        description: 'Connectez-vous pour ajouter aux favoris',
        variant: 'destructive' 
      });
      return false;
    }

    // Check if already favorited
    if (favorites.includes(propertyId)) {
      return true;
    }

    // Optimistically update UI first
    setFavorites((prev) => [...prev, propertyId]);

    try {
      // Double-check session before making request
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
        toast({ 
          title: 'Session expirée', 
          description: 'Veuillez vous reconnecter.',
          variant: 'destructive' 
        });
        return false;
      }

      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: propertyId });

      if (error) {
        // Revert on error
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
        console.error('Error adding favorite:', error);
        
        // Handle specific errors
        if (error.code === '23505') {
          // Duplicate key - already favorited, just return success
          return true;
        }
        
        toast({ 
          title: 'Erreur', 
          description: 'Impossible d\'ajouter aux favoris. Vérifiez votre connexion.', 
          variant: 'destructive' 
        });
        return false;
      }

      return true;
    } catch (error) {
      // Revert on error
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
      console.error('Error adding favorite:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'ajouter aux favoris. Vérifiez votre connexion.', 
        variant: 'destructive' 
      });
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
