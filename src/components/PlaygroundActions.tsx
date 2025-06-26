
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Playground } from '@/types/playground';
import PlaygroundRating from './PlaygroundRating';

interface PlaygroundActionsProps {
  playground: Playground;
  isUserCheckedIn: boolean;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  onCheckInClick: () => void;
  onCheckOutClick: () => void;
  onRatingUpdate?: (playgroundId: string, newRating: number, newRatingCount: number) => void;
}

const PlaygroundActions: React.FC<PlaygroundActionsProps> = ({
  playground,
  isUserCheckedIn,
  isCheckingIn,
  isCheckingOut,
  onCheckInClick,
  onCheckOutClick,
  onRatingUpdate
}) => {
  return (
    <div className="flex justify-between items-center">
      {isUserCheckedIn ? (
        <Button 
          variant="destructive" 
          onClick={onCheckOutClick} 
          disabled={isCheckingOut}
          className="arcade-button arcade-button-danger"
        >
          {isCheckingOut ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              CHECK-OUT...
            </>
          ) : (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              CHECK-OUT
            </>
          )}
        </Button>
      ) : (
        <Button 
          onClick={onCheckInClick} 
          disabled={isCheckingIn}
          className="arcade-button arcade-button-primary"
        >
          {isCheckingIn ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              CHECK-IN...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              CHECK-IN
            </>
          )}
        </Button>
      )}
      <PlaygroundRating 
        playground={playground} 
        onRatingUpdate={onRatingUpdate}
      />
    </div>
  );
};

export default PlaygroundActions;
