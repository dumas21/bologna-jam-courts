import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingData } from '@/hooks/useRatings';

interface RatingFormProps {
  playgroundId: string;
  onSubmit: (playgroundId: string, rating: RatingData) => Promise<boolean>;
  onClose: () => void;
}

const categories = [
  { key: 'court_condition', label: 'CAMPO', emoji: '🏀' },
  { key: 'hoops_quality', label: 'CANESTRI', emoji: '🎯' },
  { key: 'cleanliness', label: 'PULIZIA', emoji: '✨' },
  { key: 'atmosphere', label: 'ATMOSFERA', emoji: '🔥' },
] as const;

const StarRow = ({ value, onChange, label, emoji }: { value: number; onChange: (v: number) => void; label: string; emoji: string }) => (
  <div className="flex items-center justify-between gap-2 py-2">
    <span className="text-xs font-press-start w-28 truncate">{emoji} {label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 transition-transform hover:scale-125 active:scale-95"
        >
          <Star
            size={20}
            className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  </div>
);

const RatingForm: React.FC<RatingFormProps> = ({ playgroundId, onSubmit, onClose }) => {
  const [ratings, setRatings] = useState({
    court_condition: 0,
    hoops_quality: 0,
    cleanliness: 0,
    atmosphere: 0,
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = Object.values(ratings).every(v => v > 0);

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    const success = await onSubmit(playgroundId, { ...ratings, notes: notes.trim() || undefined });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="bg-black border-2 border-jam-neon-orange rounded-xl p-4 space-y-3" style={{ boxShadow: '0 0 20px rgba(255,107,53,0.3)' }}>
      <h3 className="text-sm font-press-start text-jam-neon-orange text-center">⭐ VALUTA IL CAMPO ⭐</h3>

      <div className="space-y-1">
        {categories.map(cat => (
          <StarRow
            key={cat.key}
            value={ratings[cat.key]}
            onChange={(v) => setRatings(prev => ({ ...prev, [cat.key]: v }))}
            label={cat.label}
            emoji={cat.emoji}
          />
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Note opzionali..."
        maxLength={200}
        rows={2}
        className="w-full rounded-lg text-xs p-2"
      />

      <div className="flex gap-2">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 text-xs border-gray-600"
        >
          ANNULLA
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="flex-1 text-xs arcade-button bg-jam-neon-orange hover:bg-orange-600"
        >
          <Send size={14} className="mr-1" />
          {isSubmitting ? 'INVIO...' : 'INVIA'}
        </Button>
      </div>
    </div>
  );
};

export default RatingForm;
