import React, { useCallback, useEffect, useState } from 'react';
import { Check, X, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { playgroundData } from '@/data/playgroundData';

interface ISuggestion {
  id: string;
  playground_id: string;
  stars: number | null;
  has_lighting: boolean | null;
  has_water: boolean | null;
  has_parking: boolean | null;
  has_bike_parking: boolean | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const nameOf = (id: string) => playgroundData.find(p => p.id === id)?.name || id;

const AdminSuggestions: React.FC = () => {
  const [items, setItems] = useState<ISuggestion[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const load = useCallback(async () => {
    const { data, error } = await (supabase.from as any)('playground_suggestions')
      .select('*').eq('status', filter).order('created_at', { ascending: false }).limit(200);
    if (!error) setItems(data || []);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const review = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await (supabase.from as any)('playground_suggestions')
      .update({ status, reviewed_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error('Errore aggiornamento'); return; }
    toast.success(status === 'approved' ? 'Approvata e pubblicata' : 'Rifiutata');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="text-xs">
            {f === 'pending' ? 'IN ATTESA' : f === 'approved' ? 'APPROVATE' : 'RIFIUTATE'}
          </Button>
        ))}
      </div>
      {items.length === 0 && <p className="text-sm text-gray-400">Nessuna segnalazione.</p>}
      {items.map(s => (
        <div key={s.id} className="p-4 rounded-lg border-2 border-orange-500/50 bg-black/60 space-y-2">
          <div className="flex justify-between gap-2">
            <strong className="text-orange-300 text-sm">{nameOf(s.playground_id)}</strong>
            <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleString('it-IT')}</span>
          </div>
          <div className="text-xs text-gray-200 flex flex-wrap gap-3">
            {s.stars && <span className="flex items-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400" />{s.stars}/5</span>}
            {s.has_lighting !== null && <span>💡 Luci: {s.has_lighting ? 'ON' : 'OFF'}</span>}
            {s.has_water != null && <span>🚰 Fontanella: {s.has_water ? 'ON' : 'OFF'}</span>}
            {s.has_parking != null && <span>🚗 Parcheggio: {s.has_parking ? 'ON' : 'OFF'}</span>}
            {s.has_bike_parking != null && <span>🚲 Bici: {s.has_bike_parking ? 'ON' : 'OFF'}</span>}
          </div>
          {s.notes && <p className="text-xs text-gray-300 whitespace-pre-wrap">{s.notes}</p>}
          {filter === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => review(s.id, 'approved')} className="bg-green-600 hover:bg-green-700"><Check size={14} className="mr-1" />APPROVA</Button>
              <Button size="sm" variant="destructive" onClick={() => review(s.id, 'rejected')}><X size={14} className="mr-1" />RIFIUTA</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminSuggestions;
