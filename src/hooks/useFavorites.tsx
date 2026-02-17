import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavorites([]); return; }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('playground_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setFavorites(data.map((f: any) => f.playground_id));
    }
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (playgroundId: string) => {
    if (!isAuthenticated || !user) return false;

    if (favorites.includes(playgroundId)) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('playground_id', playgroundId);
      setFavorites(prev => prev.filter(id => id !== playgroundId));
    } else {
      await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, playground_id: playgroundId });
      setFavorites(prev => [...prev, playgroundId]);
    }
    return true;
  };

  const isFavorite = (playgroundId: string) => favorites.includes(playgroundId);

  return { favorites, toggleFavorite, isFavorite };
}
