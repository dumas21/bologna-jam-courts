
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MapPin, Check, Sun } from "lucide-react";
import { Playground, playgroundData } from "@/types/playground";

const formSchema = z.object({
  name: z.string().min(3, { message: "Il nome deve avere almeno 3 caratteri" }),
  address: z.string().min(5, { message: "Inserisci un indirizzo valido" }),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  openHours: z.string().min(5, { message: "Inserisci orari validi (es. 08:00 - 22:00)" }),
  hasShade: z.boolean().default(false),
  hasFountain: z.boolean().default(false),
  hasAmenities: z.boolean().default(false),
  hasLighting: z.boolean().default(false),
  basketCount: z.coerce.number().min(1).default(1),
});

type FormValues = z.infer<typeof formSchema>;

const AddPlayground = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      lat: 44.49, // Default coordinate Bologna
      lng: 11.34,
      openHours: "08:00 - 22:00",
      hasShade: false,
      hasFountain: false,
      hasAmenities: false,
      hasLighting: false,
      basketCount: 2,
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Check for duplicate coordinates
    const isDuplicate = playgroundData.some(
      pg => Math.abs(pg.lat - data.lat) < 0.0001 && Math.abs(pg.lng - data.lng) < 0.0001
    );
    
    if (isDuplicate) {
      toast({
        title: "Errore",
        description: "Esiste già un playground in questa posizione!",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Create new playground with unique ID
    const newPlayground: Playground = {
      id: `pg-${Date.now()}`,
      name: data.name,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      openHours: data.openHours,
      hasShade: data.hasShade,
      hasFountain: data.hasFountain,
      hasAmenities: data.hasAmenities,
      hasLighting: data.hasLighting,
      currentPlayers: 0,
      totalCheckins: 0,
      basketCount: data.basketCount,
      rating: 0,
      ratingCount: 0,
      comments: []
    };
    
    // Play sound effect
    playSoundEffect('add');
    
    // In a real app, we'd save to a database here
    // For demo, we'll add to the array and navigate back
    playgroundData.push(newPlayground);
    
    toast({
      title: "Playground aggiunto!",
      description: "Il nuovo playground è stato aggiunto con successo.",
    });
    
    setIsSubmitting(false);
    navigate("/");
  };

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
          <h2 className="font-press-start text-xs md:text-sm text-center py-2">
            AGGIUNGI UN NUOVO PLAYGROUND
          </h2>
        </div>
        
        <div className="pixel-card max-w-2xl mx-auto p-6 bg-black bg-opacity-60 backdrop-blur-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-press-start text-xs text-jam-orange">Nome Playground</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Playground Centrale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-press-start text-xs text-jam-orange">Indirizzo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Via Roma 123, Bologna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-press-start text-xs text-jam-orange">Latitudine</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="44.4949" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-press-start text-xs text-jam-orange">Longitudine</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="11.3426" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="openHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-press-start text-xs text-jam-orange">Orari</FormLabel>
                    <FormControl>
                      <Input placeholder="08:00 - 22:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basketCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-press-start text-xs text-jam-orange">Numero di Canestri</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hasShade"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-press-start text-xs">
                        Area Ombreggiata
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasFountain"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-press-start text-xs">
                        Fontanella
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasAmenities"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-press-start text-xs">
                        Servizi
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasLighting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-press-start text-xs">
                        Illuminazione
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="pixel-button w-full" 
                disabled={isSubmitting}
                onClick={() => !isSubmitting && playSoundEffect('click')}
              >
                {isSubmitting ? 'INVIO...' : 'AGGIUNGI PLAYGROUND'}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      
      <footer className="bg-black bg-opacity-60 backdrop-blur-md border-t-4 border-jam-purple py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/60">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AddPlayground;
