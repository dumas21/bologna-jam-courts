
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
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { isLoggedIn, nickname } = useUser();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckInClick = async () => {
    setIsCheckingIn(true);
    const success = await onCheckIn(playground.id, nickname || 'unknown');
    setIsCheckingIn(false);
    if (success) {
      toast({
        title: "Check-in effettuato",
        description: `Ti sei registrato al ${playground.name}!`,
      });
    } else if (success === false) {
      toast({
        title: "Errore",
        description: "Devi effettuare il login per fare check-in",
        variant: "destructive"
      });
    }
  };

  const handleCheckOutClick = async () => {
    setIsCheckingOut(true);
    const success = await onCheckOut(playground.id, nickname || 'unknown');
    setIsCheckingOut(false);
    if (success) {
      toast({
        title: "Check-out effettuato",
        description: `Hai effettuato il check-out dal ${playground.name}.`,
      });
    } else if (success === false) {
      toast({
        title: "Errore",
        description: "Devi effettuare il login per fare check-out",
        variant: "destructive"
      });
    }
  };

  const isUserCheckedIn = isLoggedIn && hasUserCheckedIn(playground.id, nickname || 'unknown');
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
              isLoggedIn={isLoggedIn}
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
