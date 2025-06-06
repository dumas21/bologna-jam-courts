import React, { useState, useEffect } from 'react';
import { Playground } from '@/types/playground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Droplets, TreePine, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
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
}

const PlaygroundDetail: React.FC<PlaygroundDetailProps> = ({ playground, onCheckIn, onCheckOut, hasUserCheckedIn, checkInRecords }) => {
  const { toast } = useToast();
  const { isLoggedIn, nickname } = useUser();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${playground.latitude}&lon=${playground.longitude}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=it`
        );
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Errore nel recupero dei dati meteo:", error);
        toast({
          title: "Errore meteo",
          description: "Impossibile caricare le informazioni meteo",
          variant: "destructive"
        });
      }
    };

    if (playground.latitude && playground.longitude) {
      fetchWeatherData();
    }
  }, [playground.latitude, playground.longitude, toast]);

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
    <Card className="bologna-card mt-4">
      <CardHeader>
        <CardTitle className="bologna-heading flex items-center justify-between">
          {playground.name}
          <Badge variant="secondary" className="bologna-text">{playground.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details" className="bologna-tab text-sm">Dettagli</TabsTrigger>
            <TabsTrigger value="community" className="bologna-tab text-sm">Community</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${playground.address}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bologna-text hover:text-blue-700 transition-colors"
                >
                  {playground.address}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <span className="bologna-text">Orario: {playground.opening_hours || 'Non disponibile'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-500" />
                <span className="bologna-text">
                  {checkInCount} persone hanno fatto check-in
                </span>
              </div>
              {weatherData && (
                <WeatherInfo weatherData={weatherData} />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {playground.features.water && <Droplets size={16} className="text-blue-400" />}
                  {playground.features.water && <span className="bologna-text">Acqua potabile</span>}
                </div>
                <div className="flex items-center gap-2">
                  {playground.features.shade && <TreePine size={16} className="text-green-600" />}
                  {playground.features.shade && <span className="bologna-text">Ombra disponibile</span>}
                </div>
                <div className="flex items-center gap-2">
                  {playground.features.lighting && <Lightbulb size={16} className="text-yellow-500" />}
                  {playground.features.lighting && <span className="bologna-text">Illuminazione notturna</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                {isLoggedIn ? (
                  isUserCheckedIn ? (
                    <Button 
                      variant="destructive" 
                      onClick={handleCheckOutClick} 
                      disabled={isCheckingOut}
                      className="bologna-button-primary"
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
                      className="bologna-button-primary"
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
                  <Button disabled className="bologna-button-primary">
                    Login per Check-in
                  </Button>
                )}
                <PlaygroundRating playgroundId={playground.id} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="community">
            <div className="space-y-4">
              <PlaygroundChat playgroundId={playground.id} />
              <UserList playgroundId={playground.id} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaygroundDetail;
