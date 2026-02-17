import React from 'react';
import { Users, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckInButtonProps {
  playgroundId: string;
  playerCount: number;
  fieldStatus: { label: string; color: string };
  isUserHere: boolean;
  isLoading: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({
  playerCount,
  fieldStatus,
  isUserHere,
  isLoading,
  onCheckIn,
  onCheckOut,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Status badge */}
      <div className={`flex items-center gap-2 text-xs font-press-start ${fieldStatus.color}`}>
        <Users size={14} />
        <span>{fieldStatus.label}</span>
      </div>

      {/* Check-in / Check-out button */}
      {isUserHere ? (
        <Button
          onClick={onCheckOut}
          disabled={isLoading}
          className="arcade-button bg-red-600 hover:bg-red-700 border-red-400 text-xs px-6 py-3"
        >
          <LogOut size={16} className="mr-2" />
          CHECK-OUT
        </Button>
      ) : (
        <Button
          onClick={onCheckIn}
          disabled={isLoading}
          className="arcade-button bg-green-600 hover:bg-green-700 border-green-400 text-xs px-6 py-3 animate-pulse"
        >
          <LogIn size={16} className="mr-2" />
          GIOCO ORA!
        </Button>
      )}
    </div>
  );
};

export default CheckInButton;
