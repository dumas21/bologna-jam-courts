
import { useState } from 'react';
import { Star } from 'lucide-react';
import { Playground } from '@/types/playground';
import { useToast } from '@/components/ui/use-toast';
import { ClientRateLimiter } from '@/utils/rateLimiting';
import { SecureStorage } from '@/utils/secureStorage';

interface PlaygroundRatingProps {
  playground: Playground;
  onRatingUpdate?: (playgroundId: string, newRating: number, newRatingCount: number) => void;
}

const PlaygroundRating = ({ playground, onRatingUpdate }: PlaygroundRatingProps) => {
  const { toast } = useToast();
  const sessionId = SecureStorage.getSessionId();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(() => {
    // Check if user has already voted for this playground using session ID
    const voted = SecureStorage.getUserPreference(`voted_${playground.id}_${sessionId}`);
    return voted === true;
  });
  
  // Calculate the average rating (rounding to nearest 0.1)
  const rating = playground.rating || 0;
  
  const handleRatingClick = (stars: number) => {
    if (hasVoted) {
      toast({
        title: "Hai già votato",
        description: "Puoi votare solo una volta per playground",
        variant: "destructive"
      });
      return;
    }
    
    // Check rate limiting
    const limitCheck = ClientRateLimiter.checkLimit('RATING');
    if (!limitCheck.allowed) {
      const timeInMinutes = Math.ceil((limitCheck.remainingTime || 0) / (1000 * 60));
      toast({
        title: "Limite raggiunto",
        description: `Troppi voti recenti. Riprova tra ${timeInMinutes} minuti.`,
        variant: "destructive"
      });
      return;
    }
    
    // Calculate new rating
    const currentCount = playground.ratingCount || 0;
    const currentTotal = (playground.rating || 0) * currentCount;
    const newCount = currentCount + 1;
    const newRating = (currentTotal + stars) / newCount;
    
    // Update local storage to mark as voted using session ID
    SecureStorage.setUserPreference(`voted_${playground.id}_${sessionId}`, true);
    setHasVoted(true);
    
    // Call the update function if provided
    if (onRatingUpdate) {
      onRatingUpdate(playground.id, newRating, newCount);
    }
    
    // Play sound effect
    const audio = new Audio('/sounds/rating.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    const remaining = ClientRateLimiter.getRemainingAttempts('RATING');
    toast({
      title: "Grazie per il tuo voto!",
      description: `Hai dato ${stars} stelle a ${playground.name}. Ti rimangono ${remaining} voti oggi.`,
    });
  };

  return (
    <div className="flex flex-col items-start bg-black bg-opacity-60 p-4 rounded-lg border border-orange-500/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm nike-text text-white">VALUTAZIONE:</span>
        <span className="text-yellow-400 font-bold text-lg nike-text">
          {rating.toFixed(1)}
        </span>
        <span className="text-xs text-white/60 nike-text">
          ({playground.ratingCount || 0})
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const filled = starValue <= (hoveredRating || rating);
          const isHovered = hoveredRating && starValue <= hoveredRating;
          
          return (
            <Star
              key={index}
              size={20}
              className={`
                transition-all duration-200 transform
                ${filled ? 'text-yellow-400 fill-current' : 'text-gray-400'} 
                ${isHovered ? 'text-yellow-300 scale-110' : ''}
                ${!hasVoted ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              `}
              onMouseEnter={() => !hasVoted && setHoveredRating(starValue)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRatingClick(starValue)}
            />
          );
        })}
      </div>
      
      {hasVoted && (
        <span className="text-xs text-green-400 mt-2 nike-text">GRAZIE PER IL VOTO!</span>
      )}
      
      <div className="text-xs text-white/40 mt-1">
        Voti rimasti oggi: {ClientRateLimiter.getRemainingAttempts('RATING')}/3
      </div>
    </div>
  );
};

export default PlaygroundRating;
