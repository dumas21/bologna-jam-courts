
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { usePlaygrounds } from "@/hooks/usePlaygrounds";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Schema di validazione per login
const loginSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(6, { message: "La password deve avere almeno 6 caratteri" }),
});

// Schema di validazione per registrazione
const registerSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(6, { message: "La password deve avere almeno 6 caratteri" }),
  confirmPassword: z.string().min(6, { message: "La password deve avere almeno 6 caratteri" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const { login } = useUser();
  const { registerUser, verifyLogin } = usePlaygrounds();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form per il login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Form per la registrazione
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    // Special admin login check
    if (values.email === "bergami.matteo@gmail.com" && values.password === "Admin2025!") {
      login(values.email, true);
      
      // Play admin login sound
      const audio = new Audio('/sounds/admin.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      toast({
        title: "Login amministratore",
        description: "Hai effettuato l'accesso come amministratore!",
      });
      
      navigate("/admin");
      return;
    }
    
    const user = verifyLogin(values.email, values.password);
    
    if (user) {
      login(values.email, user.isAdmin);
      
      // Play login sound
      const audio = new Audio('/sounds/login.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      toast({
        title: "Login effettuato!",
        description: `Benvenuto, ${values.email}!`,
      });
      
      navigate("/");
    } else {
      // Play error sound
      const audio = new Audio('/sounds/error.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      toast({
        title: "Errore",
        description: "Email o password non corretti",
        variant: "destructive",
      });
    }
  };
  
  const handleRegister = (values: z.infer<typeof registerSchema>) => {
    const success = registerUser(values.email, values.password);
    
    if (success) {
      // Play success sound
      const audio = new Audio('/sounds/register.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
      
      login(values.email, false); // Registrato come utente normale
      
      toast({
        title: "Registrazione completata!",
        description: `Benvenuto, ${values.email}!`,
      });
      
      navigate("/");
    } else {
      // Play error sound
      const audio = new Audio('/sounds/error.mp3');
      audio.play().catch(err => console.log('Audio playback error:', err));
    }
  };

  const playSound = (soundName: string) => {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              playSound('tab');
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login" className="font-press-start text-xs">LOGIN</TabsTrigger>
              <TabsTrigger value="register" className="font-press-start text-xs">REGISTRATI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
                <h2 className="font-press-start text-xs md:text-sm text-center py-2 font-bold">
                  ACCEDI AL TUO ACCOUNT
                </h2>
              </div>
              
              <div className="pixel-card p-8">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-press-start text-xs text-jam-orange">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white text-black" placeholder="La tua email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-press-start text-xs text-jam-orange">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password"
                              className="bg-white text-black" 
                              placeholder="La tua password" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="pixel-button w-full"
                      onClick={() => playSound('click')}
                    >
                      ACCEDI
                    </Button>
                  </form>
                </Form>
                
                <p className="mt-6 text-center text-xs text-white/60">
                  Non hai un account?{" "}
                  <span 
                    className="text-jam-orange cursor-pointer" 
                    onClick={() => {
                      setActiveTab("register");
                      playSound('tab');
                    }}
                  >
                    Registrati
                  </span>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
                <h2 className="font-press-start text-xs md:text-sm text-center py-2 font-bold">
                  CREA UN NUOVO ACCOUNT
                </h2>
              </div>
              
              <div className="pixel-card p-8">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6 bg-white text-black rounded-md p-6">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-press-start text-xs text-black">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white text-black" placeholder="La tua email" />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-press-start text-xs text-black">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password"
                              className="bg-white text-black" 
                              placeholder="Scegli una password" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-press-start text-xs text-black">
                            Conferma Password
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password"
                              className="bg-white text-black" 
                              placeholder="Conferma la password" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="pixel-button w-full"
                      onClick={() => playSound('click')}
                    >
                      REGISTRATI
                    </Button>
                  </form>
                </Form>
                
                <p className="mt-6 text-center text-xs text-white/60">
                  Hai già un account?{" "}
                  <span 
                    className="text-jam-orange cursor-pointer" 
                    onClick={() => {
                      setActiveTab("login");
                      playSound('tab');
                    }}
                  >
                    Accedi
                  </span>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="bg-black bg-opacity-80 border-t-4 border-jam-purple py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/60">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
