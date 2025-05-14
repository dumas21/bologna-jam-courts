
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
import { Lightbulb, MapPin } from "lucide-react";
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
  hasLighting: z.boolean().default(false), // Aggiunta illuminazione
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
      hasLighting: false, // Default false
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
      name: data.name,           // Assegna esplicitamente ogni proprietà richiesta
      address: data.address,     // per risolvere l'errore TypeScript
      lat: data.lat,
      lng: data.lng,
      openHours: data.openHours,
      hasShade: data.hasShade,
      hasFountain: data.hasFountain,
      hasAmenities: data.hasAmenities,
      hasLighting: data.hasLighting,
      currentPlayers: 0,
    };
    
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

  return (
    <div className="min-h-screen flex flex-col bg-jam-dark text-white">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
          <h2 className="font-press-start text-xs md:text-sm text-center py-2">
            AGGIUNGI UN NUOVO PLAYGROUND
          </h2>
        </div>
        
        <div className="pixel-card max-w-2xl mx-auto p-6">
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
                    <FormLabel className="font-press-start text-xs text-jam-orange">Orari Apertura</FormLabel>
                    <FormControl>
                      <Input placeholder="08:00 - 22:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <FormField
                  control={form.control}
                  name="hasShade"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm">Ombreggiato</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasFountain"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm">Fontanella</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasAmenities"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm">Bar/Gelaterie vicine</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasLighting"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm">Illuminazione notturna</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 pixel-button"
              >
                {isSubmitting ? "Aggiunta in corso..." : "Aggiungi Playground"}
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default AddPlayground;
