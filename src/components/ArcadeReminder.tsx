import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type TReminder = 'login' | 'leave' | null;

const MESSAGES: Record<'login' | 'leave', { icon: string; text: string }> = {
  login: { icon: '🏀💧', text: 'RICORDATI DI PORTARE UN PALLONE ED ACQUA' },
  leave: { icon: '🧹', text: 'HAI LASCIATO PULITO?' },
};

const ArcadeReminder: React.FC = () => {
  const [reminder, setReminder] = useState<TReminder>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && !sessionStorage.getItem('arcadeLoginShown')) {
        sessionStorage.setItem('arcadeLoginShown', '1');
        setReminder('login');
      }
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('arcadeLoginShown');
        setReminder('leave');
      }
    });
    const onLeave = () => setReminder('leave');
    window.addEventListener('arcade-reminder', onLeave);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener('arcade-reminder', onLeave);
    };
  }, []);

  useEffect(() => {
    if (!reminder) return;
    const t = setTimeout(() => setReminder(null), 6000);
    return () => clearTimeout(t);
  }, [reminder]);

  if (!reminder) return null;
  const m = MESSAGES[reminder];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70" onClick={() => setReminder(null)} role="alertdialog" aria-live="assertive">
      <div className="max-w-sm w-full p-6 rounded-xl border-4 border-orange-500 bg-black text-center animate-scale-in" style={{ boxShadow: '0 0 30px rgba(255,107,53,0.7)' }}>
        <div className="text-4xl mb-3">{m.icon}</div>
        <p className="font-press-start text-sm leading-relaxed text-orange-400" style={{ textShadow: '0 0 10px #FF6B35' }}>{m.text}</p>
        <button type="button" onClick={() => setReminder(null)} className="mt-5 px-6 min-h-[44px] rounded-lg border-2 border-cyan-400 text-cyan-300 font-press-start text-xs">OK!</button>
      </div>
    </div>
  );
};

export default ArcadeReminder;
