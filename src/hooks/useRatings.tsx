import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface RatingData {
  court_condition: number;
  hoops_quality: number;
  cleanliness: number;
  atmosphere: number;
  notes?: string;
}

export interface AggregatedRating {
  average: number;
  count: number;
  breakdown: {
    court_condition: number;
    hoops_quality: number;
    cleanliness: number;
    atmosphere: number;
  };
}

export function useRatings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [ratingsMap, setRatingsMap] = useState<Record<string, AggregatedRating>>({});

  const fetchRatings = useCallback(async () => {
    const { data, error } = await (supabase.rpc as any)('get_playground_rating_summary');

    if (!error && data) {
      const result: Record<string, AggregatedRating> = {};
      (data as any[]).forEach((r) => {
        const cc = Number(r.avg_court_condition) || 0;
        const hq = Number(r.avg_hoops_quality) || 0;
        const cl = Number(r.avg_cleanliness) || 0;
        const at = Number(r.avg_atmosphere) || 0;
        result[r.playground_id] = {
          average: (cc + hq + cl + at) / 4,
          count: Number(r.rating_count) || 0,
          breakdown: { court_condition: cc, hoops_quality: hq, cleanliness: cl, atmosphere: at },
        };
      });
      setRatingsMap(result);
    }
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const submitRating = async (playgroundId: string, rating: RatingData) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "LOGIN RICHIESTO",
        description: "Devi essere loggato per valutare un campo.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase.from('playground_ratings').insert({
      user_id: user.id,
      playground_id: playgroundId,
      court_condition: rating.court_condition,
      hoops_quality: rating.hoops_quality,
      cleanliness: rating.cleanliness,
      atmosphere: rating.atmosphere,
      notes: rating.notes || null,
    });

    if (error) {
      toast({
        title: "ERRORE VALUTAZIONE",
        description: "Non è stato possibile salvare la valutazione.",
        variant: "destructive",
      });
      return false;
    }

    toast({ title: "VALUTAZIONE SALVATA! ⭐", description: "Grazie per il tuo feedback!" });
    await fetchRatings();
    return true;
  };

  const getRating = (playgroundId: string): AggregatedRating | null => {
    return ratingsMap[playgroundId] || null;
  };

  return { ratingsMap, submitRating, getRating, fetchRatings };
}
