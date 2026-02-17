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
    const { data, error } = await supabase
      .from('playground_ratings')
      .select('playground_id, court_condition, hoops_quality, cleanliness, atmosphere');

    if (!error && data) {
      const map: Record<string, { total: number[]; count: number; cc: number; hq: number; cl: number; at: number }> = {};
      
      data.forEach((r: any) => {
        if (!map[r.playground_id]) {
          map[r.playground_id] = { total: [], count: 0, cc: 0, hq: 0, cl: 0, at: 0 };
        }
        const avg = (r.court_condition + r.hoops_quality + r.cleanliness + r.atmosphere) / 4;
        map[r.playground_id].total.push(avg);
        map[r.playground_id].count++;
        map[r.playground_id].cc += r.court_condition;
        map[r.playground_id].hq += r.hoops_quality;
        map[r.playground_id].cl += r.cleanliness;
        map[r.playground_id].at += r.atmosphere;
      });

      const result: Record<string, AggregatedRating> = {};
      Object.entries(map).forEach(([pid, v]) => {
        result[pid] = {
          average: v.total.reduce((a, b) => a + b, 0) / v.count,
          count: v.count,
          breakdown: {
            court_condition: v.cc / v.count,
            hoops_quality: v.hq / v.count,
            cleanliness: v.cl / v.count,
            atmosphere: v.at / v.count,
          },
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
