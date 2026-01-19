
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
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-98 text-white p-3 md:p-4 z-50 border-t-2 border-jam-purple shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 text-xs md:text-sm leading-relaxed">
          <p>
            Utilizziamo cookie per migliorare la tua esperienza.
            <span 
              className="text-jam-orange hover:underline cursor-pointer ml-1 inline-block"
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-policy'))}
            >
              Maggiori info
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAccept}
            className="border-jam-orange text-jam-orange hover:bg-jam-orange hover:text-white text-xs px-3 py-1.5"
          >
            Accetta
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-gray-700 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
