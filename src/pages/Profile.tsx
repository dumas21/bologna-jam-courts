import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { playgroundData } from '@/data/playgroundData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart, Clock, User, ArrowLeft, Star } from 'lucide-react';

interface CheckInHistory {
  id: string;
  playground_id: string;
  checked_in_at: string;
  checked_out_at: string | null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [history, setHistory] = useState<CheckInHistory[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchHistory = async () => {
      const { data } = await supabase
        .from('field_check_ins')
        .select('id, playground_id, checked_in_at, checked_out_at')
        .order('checked_in_at', { ascending: false })
        .limit(50);

      if (data) setHistory(data as CheckInHistory[]);
    };

    fetchHistory();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jam-neon-orange" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col arcade-container">
        <div className="neptune-background" />
        <Header />
        <main className="container mx-auto p-4 flex-1 relative z-10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-sm font-press-start text-jam-neon-orange">DEVI ESSERE LOGGATO</p>
            <Button onClick={() => navigate('/auth')} className="arcade-button bg-jam-neon-orange">
              VAI AL LOGIN
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const getPlaygroundName = (id: string) => playgroundData.find(p => p.id === id)?.name || `Campo #${id}`;

  const favoritePlaygrounds = playgroundData.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="neptune-background" />
      <Header />
      <main className="container mx-auto p-4 flex-1 relative z-10 space-y-6">
        <Button onClick={() => navigate('/')} variant="ghost" className="text-xs">
          <ArrowLeft size={14} className="mr-1" /> TORNA ALLA MAPPA
        </Button>

        {/* Profile card */}
        <div className="bg-black bg-opacity-80 border-2 border-jam-neon-orange rounded-xl p-6 text-center space-y-3" style={{ boxShadow: '0 0 20px rgba(255,107,53,0.3)' }}>
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-jam-neon-orange to-jam-yellow flex items-center justify-center">
            <User size={36} className="text-black" />
          </div>
          <h1 className="font-press-start text-jam-neon-orange text-sm">
            {profile?.nickname || profile?.username || 'PLAYER'}
          </h1>
          <p className="text-xs text-white/60">{profile?.email}</p>
          <div className="flex justify-center gap-6 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-jam-yellow">{history.length}</div>
              <div className="text-white/50">CHECK-INS</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{favorites.length}</div>
              <div className="text-white/50">PREFERITI</div>
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-black bg-opacity-80 border-2 border-red-500 rounded-xl p-4 space-y-3">
          <h2 className="font-press-start text-xs text-red-400 flex items-center gap-2">
            <Heart size={14} /> CAMPETTI PREFERITI
          </h2>
          {favoritePlaygrounds.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-4">Nessun preferito ancora</p>
          ) : (
            <div className="space-y-2">
              {favoritePlaygrounds.map(pg => (
                <div
                  key={pg.id}
                  onClick={() => navigate(`/?playground=${pg.id}`)}
                  className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-jam-neon-orange transition-colors"
                >
                  <span className="text-xs font-press-start">{pg.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(pg.id); }}>
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-black bg-opacity-80 border-2 border-jam-blue rounded-xl p-4 space-y-3">
          <h2 className="font-press-start text-xs text-jam-blue flex items-center gap-2">
            <Clock size={14} /> STORICO CHECK-IN
          </h2>
          {history.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-4">Nessun check-in ancora</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map(h => (
                <div key={h.id} className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10">
                  <div>
                    <div className="text-xs font-press-start">{getPlaygroundName(h.playground_id)}</div>
                    <div className="text-[8px] text-white/40 mt-1">
                      {new Date(h.checked_in_at).toLocaleDateString('it-IT')} - {new Date(h.checked_in_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {h.checked_out_at ? (
                    <span className="text-[8px] text-green-400 font-press-start">COMPLETATO</span>
                  ) : (
                    <span className="text-[8px] text-yellow-400 font-press-start animate-pulse">ATTIVO</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
