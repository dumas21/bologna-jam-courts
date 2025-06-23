
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Heart } from "lucide-react";

interface WelcomeMessageProps {
  isVisible: boolean;
  onClose: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isVisible, onClose }) => {
  const handleClose = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio error:', err));
    onClose();
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto" style={{
        background: 'rgba(0, 0, 0, 0.95)',
        border: '3px solid #ff00ff',
        borderRadius: '15px',
        boxShadow: '0 0 30px #00ffff',
      }}>
        <DialogHeader>
          <DialogTitle className="text-center" style={{
            color: '#ffcc00',
            fontSize: '18px',
            fontFamily: 'Press Start 2P, monospace',
            textShadow: '2px 2px 0px #000',
            marginBottom: '20px'
          }}>
            BENVENUTO!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4 p-4">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-cyan-400 animate-bounce" />
              <Heart size={24} className="text-pink-400 animate-pulse" />
              <Users size={24} className="text-cyan-400 animate-bounce" />
            </div>
          </div>
          
          <div 
            className="text-white text-sm leading-relaxed"
            style={{
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '10px',
              lineHeight: '18px',
              textShadow: '1px 1px 0px #000'
            }}
          >
            RICORDA DI TENERE PULITO
            <br />
            E DI RISPETTARE
            <br />
            I TUOI COMPAGNI
          </div>
          
          <Button
            onClick={handleClose}
            className="w-full mt-6"
            style={{
              background: '#ff00ff',
              color: 'white',
              padding: '12px',
              fontSize: '12px',
              fontFamily: 'Press Start 2P, monospace',
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0 0 15px #ff00ff',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#00ffff';
              e.currentTarget.style.color = 'black';
              e.currentTarget.style.boxShadow = '0 0 25px #00ffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ff00ff';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = '0 0 15px #ff00ff';
            }}
          >
            HO CAPITO!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeMessage;
