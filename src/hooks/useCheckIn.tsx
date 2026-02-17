import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CheckInData {
  id: string;
  user_id: string;
  playground_id: string;
  checked_in_at: string;
  is_active: boolean;
}

interface PlaygroundActivity {
  playground_id: string;
  active_players: number;
}

export function useCheckIn() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeCounts, setActiveCounts] = useState<Record<string, number>>({});
  const [userActiveCheckIn, setUserActiveCheckIn] = useState<CheckInData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch active check-in counts for all playgrounds
  const fetchActiveCounts = useCallback(async () => {
    // First expire old check-ins
    await supabase.rpc('expire_old_check_ins');

    const { data, error } = await supabase
      .from('field_check_ins')
      .select('playground_id')
      .eq('is_active', true);

    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach((row: { playground_id: string }) => {
        counts[row.playground_id] = (counts[row.playground_id] || 0) + 1;
      });
      setActiveCounts(counts);
    }
  }, []);

  // Fetch user's active check-in
  const fetchUserCheckIn = useCallback(async () => {
    if (!user) {
      setUserActiveCheckIn(null);
      return;
    }

    const { data, error } = await supabase
      .from('field_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!error) {
      setUserActiveCheckIn(data as CheckInData | null);
    }
  }, [user]);

  // Initial load + polling every 30s
  useEffect(() => {
    fetchActiveCounts();
    fetchUserCheckIn();

    const interval = setInterval(() => {
      fetchActiveCounts();
      fetchUserCheckIn();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchActiveCounts, fetchUserCheckIn]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('field_check_ins_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'field_check_ins' },
        () => {
          fetchActiveCounts();
          fetchUserCheckIn();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveCounts, fetchUserCheckIn]);

  const checkIn = async (playgroundId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "LOGIN RICHIESTO",
        description: "Devi essere loggato per fare check-in.",
        variant: "destructive",
      });
      return false;
    }

    if (userActiveCheckIn) {
      toast({
        title: "CHECK-IN GIÀ ATTIVO",
        description: "Fai check-out dal campo attuale prima di entrare in un altro.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('field_check_ins')
      .insert({
        user_id: user.id,
        playground_id: playgroundId,
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "ERRORE CHECK-IN",
        description: "Non è stato possibile effettuare il check-in.",
        variant: "destructive",
      });
      return false;
    }

    toast({ title: "CHECK-IN! 🏀", description: "Sei sul campo! Buona partita!" });
    await fetchActiveCounts();
    await fetchUserCheckIn();
    return true;
  };

  const checkOut = async () => {
    if (!userActiveCheckIn) return false;

    setIsLoading(true);
    const { error } = await supabase
      .from('field_check_ins')
      .update({ is_active: false, checked_out_at: new Date().toISOString() })
      .eq('id', userActiveCheckIn.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: "ERRORE CHECK-OUT",
        description: "Non è stato possibile effettuare il check-out.",
        variant: "destructive",
      });
      return false;
    }

    const playgroundId = userActiveCheckIn.playground_id;
    setUserActiveCheckIn(null);
    await fetchActiveCounts();
    return playgroundId;
  };

  const getPlayerCount = (playgroundId: string) => activeCounts[playgroundId] || 0;

  const getFieldStatus = (playgroundId: string) => {
    const count = getPlayerCount(playgroundId);
    if (count === 0) return { label: 'CAMPO LIBERO', color: 'text-green-400' };
    if (count >= 10) return { label: 'PARTITA IN CORSO', color: 'text-red-400' };
    return { label: `${count} GIOCATOR${count === 1 ? 'E' : 'I'}`, color: 'text-yellow-400' };
  };

  return {
    activeCounts,
    userActiveCheckIn,
    isLoading,
    checkIn,
    checkOut,
    getPlayerCount,
    getFieldStatus,
  };
}
