import React, { useState } from 'react';
import { Star, Lightbulb, Send, Lock } from 'lucide-react';
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

  const canSend = stars > 0 || lighting !== null || notes.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    const { error } = await (supabase.from as any)('playground_suggestions').insert({
      user_id: user.id,
      playground_id: playgroundId,
      stars: stars || null,
      has_lighting: lighting,
      notes: notes.trim().slice(0, 500) || null,
    });
    setSending(false);
    if (error) {
      toast({ title: 'ERRORE', description: 'Segnalazione non inviata, riprova.', variant: 'destructive' });
      return;
    }
    setStars(0); setLighting(null); setNotes('');
    toast({ title: 'INVIATO! 🏀', description: 'La tua segnalazione sarà pubblicata dopo la verifica.' });
  };

  const choice = (val: boolean | null, label: string) => (
    <button
      type="button"
      onClick={() => setLighting(val)}
      className={`flex-1 min-h-[40px] rounded-lg border-2 text-xs font-press-start ${lighting === val ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300' : 'border-gray-600 text-gray-300'}`}
    >
      {label}
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

      <div>
        <p className="text-[10px] font-press-start text-gray-300 mb-2 flex items-center gap-1">
          <Lightbulb size={14} className="text-yellow-400" /> C'È ILLUMINAZIONE?
        </p>
        <div className="flex gap-2">
          {choice(true, 'SÌ')}
          {choice(false, 'NO')}
        </div>
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
