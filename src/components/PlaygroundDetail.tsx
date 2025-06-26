
import React, { useState } from 'react';
import { Playground } from '@/types/playground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import PlaygroundChat from './PlaygroundChat';
import UserList from './UserList';
import WeatherInfo from './WeatherInfo';
import EventBanner from './EventBanner';
import PlaygroundInfo from './PlaygroundInfo';
import PlaygroundActions from './PlaygroundActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientRateLimiter } from '@/utils/rateLimiting';
import { SecureStorage } from '@/utils/secureStorage';

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string, userNickname: string) => boolean | undefined;
  onCheckOut: (playgroundId: string, userNickname: string) => boolean | undefined;
  hasUserCheckedIn: (playgroundId: string, userNickname: string) => boolean;
  checkInRecords: { [playgroundId: string]: string[] };
  onRatingUpdate?: (playgroundId: string, newRating: number, newRatingCount: number) => void;
}

const PlaygroundDetail: React.FC<PlaygroundDetailProps> = ({ 
  playground, 
  onCheckIn, 
  onCheckOut, 
  hasUserCheckedIn, 
  checkInRecords,
  onRatingUpdate 
}) => {
  const { toast } = useToast();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Use session-based anonymous user for check-ins
  const sessionId = SecureStorage.getSessionId();
  const anonymousUser = `Anonymous_${sessionId.slice(-8)}`;

  const handleCheckInClick = async () => {
    // Check rate limiting for check-ins
    const limitCheck = ClientRateLimiter.checkLimit('CHECK_IN');
    if (!limitCheck.allowed) {
      const timeInMinutes = Math.ceil((limitCheck.remainingTime || 0) / (1000 * 60));
      toast({
        title: "Troppi tentativi",
        description: `Riprova tra ${timeInMinutes} minuti.`,
        variant: "destructive"
      });
      return;
    }

    setIsCheckingIn(true);
    const success = await onCheckIn(playground.id, anonymousUser);
    setIsCheckingIn(false);
    if (success) {
      toast({
        title: "Check-in effettuato",
        description: `Ti sei registrato al ${playground.name}!`,
      });
    }
  };

  const handleCheckOutClick = async () => {
    setIsCheckingOut(true);
    const success = await onCheckOut(playground.id, anonymousUser);
    setIsCheckingOut(false);
    if (success) {
      toast({
        title: "Check-out effettuato",
        description: `Hai effettuato il check-out dal ${playground.name}.`,
      });
    }
  };

  const isUserCheckedIn = hasUserCheckedIn(playground.id, anonymousUser);
  const checkInCount = checkInRecords[playground.id]?.length || 0;

  // Convert checked-in users to a simple format compatible with UserList
  const checkedInUsers = (checkInRecords[playground.id] || []).map((userNickname, index) => ({
    id: `${playground.id}-${index}`,
    nickname: userNickname,
    email: `${userNickname}@playground.local`,
    password: '',
    registrationDate: Date.now(),
    isAdmin: false,
    createdAt: new Date().toISOString(),
    checkedIn: true
  }));

  return (
    <Card className="mt-4 arcade-card" data-playground-details>
      <CardHeader>
        <CardTitle className="flex items-center justify-between arcade-title">
          {playground.name}
          {playground.type && <Badge variant="secondary" className="arcade-badge">{playground.type}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EventBanner playgroundId={playground.id} />
        <WeatherInfo playgroundName={playground.name} location={playground.address} />
        
        <Tabs defaultValue="details" className="w-full arcade-tabs">
          <TabsList className="w-full grid grid-cols-2 arcade-tab-list">
            <TabsTrigger value="details" className="text-sm arcade-tab">DETTAGLI</TabsTrigger>
            <TabsTrigger value="community" className="text-sm arcade-tab">COMMUNITY</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <PlaygroundInfo playground={playground} checkInCount={checkInCount} />
            <PlaygroundActions
              playground={playground}
              isUserCheckedIn={isUserCheckedIn}
              isCheckingIn={isCheckingIn}
              isCheckingOut={isCheckingOut}
              onCheckInClick={handleCheckInClick}
              onCheckOutClick={handleCheckOutClick}
              onRatingUpdate={onRatingUpdate}
            />
          </TabsContent>
          <TabsContent value="community" className="community">
            <div className="space-y-4">
              <PlaygroundChat playground={playground} />
              <UserList users={checkedInUsers} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaygroundDetail;
