
import { useState } from 'react';
import { Star } from 'lucide-react';
import { Playground } from '@/types/playground';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';

interface PlaygroundRatingProps {
  playground: Playground;
}

const PlaygroundRating = ({ playground }: PlaygroundRatingProps) => {
  const { toast } = useToast();
  const { isLoggedIn } = useUser();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Calculate the average rating (rounding to nearest 0.1)
  const rating = playground.rating || 0;
  
  const handleRatingClick = (stars: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi accedere per votare questo playground",
        variant: "destructive"
      });
      return;
    }
    
    if (hasVoted) {
      toast({
        title: "Hai già votato",
        description: "Puoi votare solo una volta per playground",
        variant: "destructive"
      });
      return;
    }
    
    // In real app, this would update the backend
    setHasVoted(true);
    
    // Play sound effect
    const audio = new Audio('/sounds/rating.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    toast({
      title: "Grazie per il tuo voto!",
      description: `Hai dato ${stars} stelle a ${playground.name}`,
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
      
      <div className="star-rating">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <Star
              key={index}
              size={20}
              className={`
                star 
                ${starValue <= (hoveredRating || rating) ? 'filled' : ''} 
                ${hoveredRating && starValue <= hoveredRating ? 'text-yellow-400' : ''}
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
    </div>
  );
};

export default PlaygroundRating;
