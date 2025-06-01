
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import CookiePolicy from './CookiePolicy';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  
  // Listen for custom events to open the policies
  React.useEffect(() => {
    const handleOpenPrivacy = () => setShowPrivacyPolicy(true);
    const handleOpenCookie = () => setShowCookiePolicy(true);
    
    window.addEventListener('open-privacy-policy', handleOpenPrivacy);
    window.addEventListener('open-cookie-policy', handleOpenCookie);
    
    return () => {
      window.removeEventListener('open-privacy-policy', handleOpenPrivacy);
      window.removeEventListener('open-cookie-policy', handleOpenCookie);
    };
  }, []);
  
  return (
    <footer className="bg-black bg-opacity-80 border-t-4 border-jam-purple py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="font-press-start text-xs text-white/60 mb-4 md:mb-0">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/60">
            <button onClick={() => navigate('/privacy')} className="hover:text-jam-orange transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/cookies')} className="hover:text-jam-orange transition-colors">
              Cookie Policy
            </button>
            <button onClick={() => navigate('/admin')} className="hover:text-jam-orange transition-colors">
              Area Admin
            </button>
          </div>
        </div>
      </div>
      
      <PrivacyPolicy 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />
      
      <CookiePolicy 
        isOpen={showCookiePolicy} 
        onClose={() => setShowCookiePolicy(false)} 
      />
    </footer>
  );
};

export default Footer;
