import React, { useState } from 'react';
import { Star, Send, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface IPlaygroundSuggestionBoxProps {
  playgroundId: string;
}

const PlaygroundSuggestionBox: React.FC<IPlaygroundSuggestionBoxProps> = ({ playgroundId }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [stars, setStars] = useState(0);
  const [lighting, setLighting] = useState<boolean | null>(null);
  const [water, setWater] = useState<boolean | null>(null);
  const [parking, setParking] = useState<boolean | null>(null);
  const [bike, setBike] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="mt-4 p-4 rounded-xl border-2 border-orange-500/60 bg-black/70 text-center">
        <Lock className="mx-auto mb-2 text-orange-400" size={20} />
        <p className="text-xs font-press-start text-orange-300 leading-relaxed">
          ACCEDI PER VOTARE E SEGNALARE MODIFICHE
        </p>
        <Link to="/auth" className="inline-block mt-3 text-xs font-press-start text-cyan-300 underline">LOGIN</Link>
      </div>
    );
  }

  const canSend = stars > 0 || [lighting, water, parking, bike].some(v => v !== null) || notes.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    const { error } = await (supabase.from as any)('playground_suggestions').insert({
      user_id: user.id,
      playground_id: playgroundId,
      stars: stars || null,
      has_lighting: lighting,
      has_water: water,
      has_parking: parking,
      has_bike_parking: bike,
      notes: notes.trim().slice(0, 500) || null,
    });
    setSending(false);
    if (error) {
      toast({ title: 'ERRORE', description: 'Segnalazione non inviata, riprova.', variant: 'destructive' });
      return;
    }
    setStars(0); setLighting(null); setWater(null); setParking(null); setBike(null); setNotes('');
    toast({ title: 'INVIATO! 🏀', description: 'La tua segnalazione sarà pubblicata dopo la verifica.' });
  };

  // Arcade ON/OFF switch: tap cycles ? -> ON -> OFF -> ?
  const ArcadeSwitch = ({ icon, label, value, onChange }: { icon: string; label: string; value: boolean | null; onChange: (v: boolean | null) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={value === true}
      aria-label={label}
      onClick={() => onChange(value === null ? true : value ? false : null)}
      className="flex items-center justify-between gap-2 w-full min-h-[48px] px-3 rounded-lg border-2 border-gray-700 bg-black active:scale-95 transition-transform"
    >
      <span className="text-[10px] font-press-start text-gray-200 text-left">{icon} {label}</span>
      <span className={`relative w-16 h-8 rounded-md border-2 flex-shrink-0 transition-colors ${value === true ? 'border-green-400 bg-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.7)]' : value === false ? 'border-red-500 bg-red-500/20' : 'border-gray-600 bg-gray-800'}`}>
        <span className={`absolute top-0.5 w-6 h-6 rounded-sm transition-all ${value === true ? 'left-[34px] bg-green-400' : value === false ? 'left-0.5 bg-red-500' : 'left-[17px] bg-gray-500'}`} />
      </span>
      <span className={`w-8 text-[10px] font-press-start ${value === true ? 'text-green-400' : value === false ? 'text-red-400' : 'text-gray-500'}`}>
        {value === true ? 'ON' : value === false ? 'OFF' : '?'}
      </span>
    </button>
  );

  return (
    <div className="mt-4 p-4 rounded-xl border-2 border-orange-500 bg-black/80 space-y-3" style={{ boxShadow: '0 0 15px rgba(255,107,53,0.3)' }}>
      <h4 className="text-xs font-press-start text-orange-400 text-center">📝 SEGNALA / VALUTA</h4>

      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button" onClick={() => setStars(s)} className="p-1 hover:scale-110" aria-label={`${s} stelle`}>
            <Star size={26} className={s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-gray-400 text-center">Tocca: ? → ON → OFF</p>
        <ArcadeSwitch icon="💡" label="LUCI" value={lighting} onChange={setLighting} />
        <ArcadeSwitch icon="🚰" label="FONTANELLA" value={water} onChange={setWater} />
        <ArcadeSwitch icon="🚗" label="PARCHEGGIO" value={parking} onChange={setParking} />
        <ArcadeSwitch icon="🚲" label="PARCHEGGIO BICI" value={bike} onChange={setBike} />
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Correzioni (orari, canestri, indirizzo...)"
        className="w-full rounded-lg text-xs p-2 bg-black border border-gray-600 text-gray-200"
      />

      <Button onClick={handleSend} disabled={!canSend || sending} className="w-full min-h-[44px] text-xs arcade-button bg-jam-neon-orange hover:bg-orange-600">
        <Send size={14} className="mr-1" /> {sending ? 'INVIO...' : 'INVIA PER APPROVAZIONE'}
      </Button>
      <p className="text-[10px] text-gray-400 text-center">Le segnalazioni vengono verificate dallo staff prima della pubblicazione.</p>
    </div>
  );
};

export default PlaygroundSuggestionBox;
