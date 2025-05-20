
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-95 text-white p-4 z-50 border-t-2 border-jam-purple">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex-1 text-sm mb-4 sm:mb-0 pr-4">
          <p>
            Questa applicazione utilizza cookie e tecnologie simili per garantirti una migliore esperienza.
            Continuando a utilizzare Playground Jam, acconsenti all'uso dei cookie come descritto nella nostra 
            <span 
              className="text-jam-orange hover:underline cursor-pointer ml-1"
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-policy'))}
            >
              Informativa sui Cookie
            </span>.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAccept}
            className="border-jam-orange text-jam-orange hover:bg-jam-orange hover:text-white"
          >
            Accetta tutti
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
