
import React, { useState } from 'react';
import { Playground } from '@/types/playground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Droplets, TreePine, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PlaygroundRating from './PlaygroundRating';
import PlaygroundChat from './PlaygroundChat';
import UserList from './UserList';
import { useUser } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string, userNickname: string) => boolean | undefined;
  onCheckOut: (playgroundId: string, userNickname: string) => boolean | undefined;
  hasUserCheckedIn: (playgroundId: string, userNickname: string) => boolean;
  checkInRecords: { [playgroundId: string]: string[] };
}

const PlaygroundDetail: React.FC<PlaygroundDetailProps> = ({ playground, onCheckIn, onCheckOut, hasUserCheckedIn, checkInRecords }) => {
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

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {playground.name}
          {playground.type && <Badge variant="secondary">{playground.type}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details" className="text-sm">Dettagli</TabsTrigger>
            <TabsTrigger value="community" className="text-sm">Community</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${playground.address}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-700 transition-colors"
                >
                  {playground.address}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <span>Orario: {playground.openHours || 'Non disponibile'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-500" />
                <span>
                  {checkInCount} persone hanno fatto check-in
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {playground.hasFountain && <Droplets size={16} className="text-blue-400" />}
                  {playground.hasFountain && <span>Acqua potabile</span>}
                </div>
                <div className="flex items-center gap-2">
                  {playground.hasShade && <TreePine size={16} className="text-green-600" />}
                  {playground.hasShade && <span>Ombra disponibile</span>}
                </div>
                <div className="flex items-center gap-2">
                  {playground.hasLighting && <Lightbulb size={16} className="text-yellow-500" />}
                  {playground.hasLighting && <span>Illuminazione notturna</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                {isLoggedIn ? (
                  isUserCheckedIn ? (
                    <Button 
                      variant="destructive" 
                      onClick={handleCheckOutClick} 
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Check-out...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Check-out
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCheckInClick} 
                      disabled={isCheckingIn}
                    >
                      {isCheckingIn ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Check-in...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Check-in
                        </>
                      )}
                    </Button>
                  )
                ) : (
                  <Button disabled>
                    Login per Check-in
                  </Button>
                )}
                <PlaygroundRating playground={playground} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="community">
            <div className="space-y-4">
              <PlaygroundChat playground={playground} />
              <UserList playground={playground} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaygroundDetail;
