import React, { useState } from 'react';
import { Playground } from '@/types/playground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Droplets, TreePine, Lightbulb, CheckCircle, XCircle, Signpost } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PlaygroundRating from './PlaygroundRating';
import PlaygroundChat from './PlaygroundChat';
import UserList from './UserList';
import WeatherInfo from './WeatherInfo';
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
    <Card className="mt-4 arcade-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between arcade-title">
          {playground.name}
          {playground.type && <Badge variant="secondary" className="arcade-badge">{playground.type}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WeatherInfo playgroundName={playground.name} location={playground.address} />
        
        <Tabs defaultValue="details" className="w-full arcade-tabs">
          <TabsList className="w-full grid grid-cols-2 arcade-tab-list">
            <TabsTrigger value="details" className="text-sm arcade-tab">DETTAGLI</TabsTrigger>
            <TabsTrigger value="community" className="text-sm arcade-tab">COMMUNITY</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="space-y-4">
              <div className="flex items-center gap-2 arcade-info">
                <Signpost size={16} className="text-orange-600 arcade-icon" />
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${playground.address}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors arcade-link"
                  style={{color: '#FFFFFF', textShadow: '1px 1px 0px #000'}}
                >
                  {playground.address}
                </a>
              </div>
              <div className="flex items-center gap-2 arcade-info">
                <Clock size={16} className="text-blue-600 arcade-icon" />
                <span>ORARIO: {playground.openHours || 'NON DISPONIBILE'}</span>
              </div>
              <div className="flex items-center gap-2 arcade-info">
                <Users size={16} className="text-green-500 arcade-icon" />
                <span>
                  {checkInCount} GIOCATORI CONNESSI
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 arcade-feature">
                  {playground.hasFountain && <Droplets size={16} className="text-blue-400 arcade-icon" />}
                  {playground.hasFountain && <span>ACQUA POTABILE</span>}
                </div>
                <div className="flex items-center gap-2 arcade-feature">
                  {playground.hasShade && <TreePine size={16} className="text-green-600 arcade-icon" />}
                  {playground.hasShade && <span>OMBRA DISPONIBILE</span>}
                </div>
                <div className="flex items-center gap-2 arcade-feature">
                  {playground.hasLighting && <Lightbulb size={16} className="text-yellow-500 arcade-icon" />}
                  {playground.hasLighting && <span>ILLUMINAZIONE NOTTURNA</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                {isLoggedIn ? (
                  isUserCheckedIn ? (
                    <Button 
                      variant="destructive" 
                      onClick={handleCheckOutClick} 
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
                      onClick={handleCheckInClick} 
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
                  )
                ) : (
                  <Button disabled className="arcade-button arcade-button-disabled">
                    LOGIN PER CHECK-IN
                  </Button>
                )}
                <PlaygroundRating 
                  playground={playground} 
                  onRatingUpdate={onRatingUpdate}
                />
              </div>
            </div>
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
