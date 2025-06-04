
import React, { useState, useEffect, useRef } from 'react';

const ShootTheHoop = () => {
  const [power, setPower] = useState(0);
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPower((prev) => {
        if (prev >= 100) setDirection(-1);
        if (prev <= 0) setDirection(1);
        return prev + direction * 5;
      });
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [direction]);

  const handleShoot = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Play sound effect
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
    
    if (power >= 40 && power <= 60) {
      setScore(score + 1);
      setMessage('🏀 CANESTRO! 🏀');
    } else {
      setMessage('❌ SBAGLIATO!');
    }
    
    setTimeout(() => {
      setMessage('');
      setPower(0);
      setDirection(1);
      intervalRef.current = setInterval(() => {
        setPower((prev) => {
          if (prev >= 100) setDirection(-1);
          if (prev <= 0) setDirection(1);
          return prev + direction * 5;
        });
      }, 50);
    }, 1500);
  };

  return (
    <div className="retro-game p-6 max-w-sm mx-auto mb-6">
      <h3 className="text-2xl mb-4 nike-text text-center" style={{ 
        fontFamily: "'Press Start 2P', cursive",
        color: '#0ff',
        textShadow: '0 0 10px #0ff'
      }}>
        SHOOT THE HOOP
      </h3>
      
      <div className="power-bar rounded h-8 w-full mb-4 relative overflow-hidden">
        <div
          className="power-level h-full transition-all duration-75"
          style={{ width: `${power}%` }}
        />
      </div>
      
      <button
        onClick={handleShoot}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-lg mb-4 font-bold text-black transition-all duration-300 transform hover:scale-105"
        style={{ 
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '14px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
        }}
      >
        TIRA! 🏀
      </button>
      
      <div className="text-center space-y-2">
        <div className="nike-text text-lg" style={{ 
          color: '#0ff',
          fontFamily: "'Press Start 2P', cursive",
          textShadow: '0 0 10px #0ff'
        }}>
          PUNTEGGIO: {score}
        </div>
        
        {message && (
          <div className="nike-text text-base font-bold animate-pulse" style={{ 
            color: message.includes('CANESTRO') ? '#00ff00' : '#ff0000',
            fontFamily: "'Press Start 2P', cursive",
            textShadow: `0 0 15px ${message.includes('CANESTRO') ? '#00ff00' : '#ff0000'}`
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShootTheHoop;
