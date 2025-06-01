
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black bg-opacity-80 border-t-4 border-jam-purple py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="font-press-start text-xs text-white/60 mb-4 md:mb-0">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/60">
            <button className="hover:text-jam-orange transition-colors">
              Privacy Policy
            </button>
            <button className="hover:text-jam-orange transition-colors">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
