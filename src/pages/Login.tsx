
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import SupabaseLoginForm from "@/components/auth/SupabaseLoginForm";
import SuccessMessage from "@/components/auth/SuccessMessage";
import ContactInfo from "@/components/auth/ContactInfo";
import WelcomeMessage from "@/components/WelcomeMessage";

const Login = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleLoginSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowWelcome(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="crt-overlay"></div>
      <div className="neptune-background"></div>
      
      <Header />
      
      <main className="container mx-auto p-4 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          <Button
            onClick={() => navigate("/")}
            className="mb-6 arcade-button arcade-button-secondary"
          >
            <ArrowLeft size={16} className="mr-2" />
            INDIETRO
          </Button>

          <Card className="arcade-card" style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: '3px dashed #ff00ff',
            borderRadius: '20px',
            boxShadow: '0 0 20px #00ffff',
          }}>
            <CardHeader>
              <CardTitle className="arcade-title text-center" style={{ 
                color: '#ffcc00', 
                fontSize: '18px',
                textShadow: '2px 2px 0px #000'
              }}>
                ARCADE LOGIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showSuccess ? (
                <SupabaseLoginForm onSuccess={handleLoginSuccess} />
              ) : (
                <SuccessMessage />
              )}
              
              <div className="mt-4">
                <img src="/lovable-uploads/08dab4be-24fd-4800-b7b1-7f55a6d6de3d.png" alt="Basket City Jam" className="w-full h-auto" />
              </div>
            </CardContent>
          </Card>

          <ContactInfo />
        </div>
      </main>
      
      <WelcomeMessage 
        isVisible={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
};

export default Login;
