
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  speed: number;
}

interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isFlying: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
}

const BasketballChallenge = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [power, setPower] = useState(0);
  const [powerDirection, setPowerDirection] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [ball, setBall] = useState<Ball>({ x: 50, y: 350, velocityX: 0, velocityY: 0, isFlying: false });
  const [basketPosition, setBasketPosition] = useState(300);
  const [basketDirection, setBasketDirection] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [basketAnimation, setBasketAnimation] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const powerIntervalRef = useRef<NodeJS.Timeout>();
  const gameIntervalRef = useRef<NodeJS.Timeout>();
  const particleIntervalRef = useRef<NodeJS.Timeout>();

  // Genera ostacoli casuali
  const generateObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    const obstacleCount = Math.min(3 + level, 8);
    
    for (let i = 0; i < obstacleCount; i++) {
      newObstacles.push({
        id: i,
        x: Math.random() * 350 + 100,
        y: Math.random() * 200 + 150,
        speed: Math.random() * 2 + 1 + level * 0.3
      });
    }
    setObstacles(newObstacles);
  }, [level]);

  // Crea particelle per effetto canestro
  const createParticles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x,
        y: y,
        velocityX: (Math.random() - 0.5) * 8,
        velocityY: Math.random() * -8 - 2,
        life: 30
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Inizia il gioco
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setBall({ x: 50, y: 350, velocityX: 0, velocityY: 0, isFlying: false });
    setParticles([]);
    generateObstacles();
    
    // Suono di inizio
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio error:', err));
  };

  // Timer del gioco
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      gameIntervalRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover');
    }
    
    return () => {
      if (gameIntervalRef.current) clearTimeout(gameIntervalRef.current);
    };
  }, [gameState, timeLeft]);

  // Animazione power bar
  useEffect(() => {
    if (gameState === 'playing' && !ball.isFlying) {
      powerIntervalRef.current = setInterval(() => {
        setPower(prev => {
          if (prev >= 100) setPowerDirection(-1);
          if (prev <= 0) setPowerDirection(1);
          return prev + powerDirection * 3;
        });
      }, 50);
    }
    
    return () => {
      if (powerIntervalRef.current) clearInterval(powerIntervalRef.current);
    };
  }, [gameState, ball.isFlying, powerDirection]);

  // Movimento canestro
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setBasketPosition(prev => {
          const newPos = prev + basketDirection * (2 + level * 0.5);
          if (newPos <= 250 || newPos >= 350) {
            setBasketDirection(prev => prev * -1);
          }
          return Math.max(250, Math.min(350, newPos));
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [gameState, basketDirection, level]);

  // Movimento ostacoli
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setObstacles(prev => prev.map(obstacle => ({
          ...obstacle,
          x: obstacle.x + obstacle.speed,
          y: obstacle.y + Math.sin(obstacle.x * 0.02) * 1
        })).filter(obstacle => obstacle.x < 500));
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Animazione particelle
  useEffect(() => {
    if (particles.length > 0) {
      particleIntervalRef.current = setInterval(() => {
        setParticles(prev => prev.map(particle => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          velocityY: particle.velocityY + 0.3,
          life: particle.life - 1
        })).filter(particle => particle.life > 0));
      }, 50);
    }
    
    return () => {
      if (particleIntervalRef.current) clearInterval(particleIntervalRef.current);
    };
  }, [particles.length]);

  // Animazione palla
  useEffect(() => {
    if (ball.isFlying) {
      animationRef.current = requestAnimationFrame(() => {
        setBall(prev => {
          const newX = prev.x + prev.velocityX;
          const newY = prev.y + prev.velocityY;
          const newVelocityY = prev.velocityY + 0.5; // Gravità
          
          // Controllo collisione con canestro (area più precisa)
          if (newX >= basketPosition - 15 && newX <= basketPosition + 15 && 
              newY >= 85 && newY <= 105 && prev.velocityY > 0) {
            // Canestro!
            const newScore = score + 10 * level;
            setScore(newScore);
            
            // Effetti canestro
            setBasketAnimation(true);
            createParticles(basketPosition, 90);
            setTimeout(() => setBasketAnimation(false), 300);
            
            // Suono canestro
            const audio = new Audio('/sounds/checkin.mp3');
            audio.play().catch(err => console.log('Audio error:', err));
            
            // Level up ogni 50 punti
            if (newScore % 50 === 0) {
              setLevel(prev => prev + 1);
              setTimeLeft(prev => prev + 10); // Bonus tempo
              generateObstacles();
            }
            
            return { x: 50, y: 350, velocityX: 0, velocityY: 0, isFlying: false };
          }
          
          // Controllo collisioni con ostacoli
          const hitObstacle = obstacles.some(obstacle => 
            Math.abs(newX - obstacle.x) < 25 && Math.abs(newY - obstacle.y) < 25
          );
          
          if (hitObstacle) {
            // Suono collisione
            const audio = new Audio('/sounds/checkout.mp3');
            audio.play().catch(err => console.log('Audio error:', err));
            
            return { x: 50, y: 350, velocityX: 0, velocityY: 0, isFlying: false };
          }
          
          // Reset se esce dallo schermo
          if (newX > 500 || newY > 400) {
            return { x: 50, y: 350, velocityX: 0, velocityY: 0, isFlying: false };
          }
          
          return { ...prev, x: newX, y: newY, velocityY: newVelocityY };
        });
      });
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [ball.isFlying, ball.x, ball.y, ball.velocityX, ball.velocityY, basketPosition, obstacles, score, level]);

  // Spara la palla
  const shootBall = () => {
    if (ball.isFlying) return;
    
    const shootPower = power / 100;
    const velocityX = 8 + shootPower * 4;
    const velocityY = -12 - shootPower * 3;
    
    setBall(prev => ({
      ...prev,
      velocityX,
      velocityY,
      isFlying: true
    }));
    
    // Suono sparo
    const audio = new Audio('/sounds/tab.mp3');
    audio.play().catch(err => console.log('Audio error:', err));
  };

  const resetGame = () => {
    setGameState('menu');
    setPower(0);
    setBall({ x: 50, y: 350, velocityX: 0, velocityY: 0, isFlying: false });
    setObstacles([]);
    setParticles([]);
  };

  if (gameState === 'menu') {
    return (
      <div className="retro-game p-6 max-w-lg mx-auto mb-6">
        <h2 className="text-3xl mb-6 nike-text text-center" style={{ 
          fontFamily: "'Press Start 2P', cursive",
          color: '#0ff',
          textShadow: '0 0 15px #0ff'
        }}>
          BASKETBALL CHALLENGE
        </h2>
        
        <div className="text-center space-y-4 mb-6">
          <p className="nike-text text-white/90" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}>
            🏀 FAI CANESTRO EVITANDO GLI OSTACOLI!
          </p>
          <p className="nike-text text-white/80" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}>
            • CLICCA PER TIRARE<br/>
            • IL CANESTRO SI MUOVE<br/>
            • OSTACOLI DA EVITARE<br/>
            • +10 PUNTI PER CANESTRO
          </p>
        </div>
        
        <button
          onClick={startGame}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 px-6 py-4 rounded-lg font-bold text-black transition-all duration-300 transform hover:scale-105"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '14px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
          }}
        >
          INIZIA PARTITA! 🚀
        </button>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="retro-game p-6 max-w-lg mx-auto mb-6">
        <h2 className="text-3xl mb-4 nike-text text-center" style={{ 
          fontFamily: "'Press Start 2P', cursive",
          color: '#ff0080',
          textShadow: '0 0 15px #ff0080'
        }}>
          GAME OVER!
        </h2>
        
        <div className="text-center space-y-4 mb-6">
          <div className="nike-text text-2xl" style={{ 
            color: '#0ff',
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '0 0 10px #0ff'
          }}>
            PUNTEGGIO: {score}
          </div>
          <div className="nike-text text-lg" style={{ 
            color: '#ffff00',
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '0 0 10px #ffff00'
          }}>
            LIVELLO: {level}
          </div>
          
          <div className="nike-text text-base" style={{ 
            color: score >= 100 ? '#00ff00' : score >= 50 ? '#ffff00' : '#ff0080',
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '12px'
          }}>
            {score >= 100 ? '🏆 CAMPIONE!' : score >= 50 ? '⭐ BRAVO!' : '💪 RIPROVA!'}
          </div>
        </div>
        
        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 px-6 py-4 rounded-lg font-bold text-black transition-all duration-300 transform hover:scale-105"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '14px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)'
          }}
        >
          GIOCA ANCORA! 🔄
        </button>
      </div>
    );
  }

  return (
    <div className="retro-game p-6 max-w-lg mx-auto mb-6">
      {/* Header con stats */}
      <div className="flex justify-between items-center mb-4" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}>
        <div className="nike-text" style={{ color: '#0ff', textShadow: '0 0 10px #0ff' }}>
          PUNTEGGIO: {score}
        </div>
        <div className="nike-text" style={{ color: '#ff0080', textShadow: '0 0 10px #ff0080' }}>
          LIVELLO: {level}
        </div>
        <div className="nike-text" style={{ color: '#ffff00', textShadow: '0 0 10px #ffff00' }}>
          TEMPO: {timeLeft}s
        </div>
      </div>

      {/* Area di gioco */}
      <div 
        ref={gameAreaRef}
        className="relative bg-black border-4 border-cyan-400 rounded-lg overflow-hidden"
        style={{ 
          width: '500px', 
          height: '400px',
          background: 'linear-gradient(180deg, #001122 0%, #000033 100%)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)'
        }}
      >
        {/* Canestro con struttura visibile */}
        <div 
          style={{
            position: 'absolute',
            left: basketPosition - 25 + 'px',
            top: '60px',
            zIndex: 15
          }}
        >
          {/* Tabellone */}
          <div
            style={{
              width: '50px',
              height: '35px',
              backgroundColor: '#ffffff',
              border: '3px solid #ff0080',
              borderRadius: '3px',
              boxShadow: '0 0 10px rgba(255, 0, 128, 0.8)',
              marginBottom: '5px'
            }}
          />
          {/* Anello del canestro */}
          <div
            style={{
              width: '40px',
              height: '8px',
              backgroundColor: basketAnimation ? '#ffff00' : '#ff0080',
              border: '2px solid #ffffff',
              borderRadius: '50px',
              marginLeft: '5px',
              boxShadow: basketAnimation ? '0 0 15px #ffff00' : '0 0 10px #ff0080',
              transition: 'all 0.3s ease'
            }}
          />
          {/* Rete */}
          <div
            style={{
              position: 'absolute',
              left: '8px',
              top: '48px',
              fontSize: '16px',
              color: '#ffffff',
              textShadow: '0 0 5px #ffffff',
              transform: basketAnimation ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
          >
            ╬╬╬
          </div>
        </div>

        {/* Ostacoli */}
        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            style={{
              position: 'absolute',
              left: obstacle.x + 'px',
              top: obstacle.y + 'px',
              fontSize: '30px',
              filter: 'drop-shadow(0 0 8px #ff4444)',
              zIndex: 5
            }}
          >
            ⚡
          </div>
        ))}

        {/* Particelle */}
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x + 'px',
              top: particle.y + 'px',
              fontSize: '8px',
              color: '#ffff00',
              opacity: particle.life / 30,
              filter: 'drop-shadow(0 0 3px #ffff00)',
              zIndex: 12
            }}
          >
            ✨
          </div>
        ))}

        {/* Palla */}
        <div
          style={{
            position: 'absolute',
            left: ball.x + 'px',
            top: ball.y + 'px',
            fontSize: '20px',
            filter: 'drop-shadow(0 0 8px #ffff00)',
            zIndex: 8,
            transition: ball.isFlying ? 'none' : 'all 0.3s ease'
          }}
        >
          🏀
        </div>

        {/* Lanciatore */}
        <div
          style={{
            position: 'absolute',
            left: '20px',
            top: '340px',
            fontSize: '40px',
            filter: 'drop-shadow(0 0 10px #00ff00)'
          }}
        >
          🤖
        </div>

        {/* Linea traiettoria quando non si sta tirando */}
        {!ball.isFlying && (
          <div
            style={{
              position: 'absolute',
              left: '70px',
              top: '350px',
              width: `${basketPosition - 70}px`,
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.3) 50%, transparent 100%)`,
              transformOrigin: 'left',
              transform: `rotate(-${Math.atan2(250, basketPosition - 70) * 180 / Math.PI}deg)`,
              zIndex: 1
            }}
          />
        )}
      </div>

      {/* Power bar */}
      {!ball.isFlying && (
        <div className="mt-4">
          <div className="text-center mb-2">
            <span className="nike-text text-sm" style={{ 
              color: '#0ff',
              fontFamily: "'Press Start 2P', cursive",
              textShadow: '0 0 5px #0ff'
            }}>
              POTENZA: {Math.round(power)}%
            </span>
          </div>
          <div className="power-bar rounded h-6 w-full mb-4 relative overflow-hidden border-2 border-cyan-400" style={{
            background: 'linear-gradient(90deg, #000033 0%, #001122 100%)',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
          }}>
            <div
              className="power-level h-full transition-all duration-75"
              style={{ 
                width: `${power}%`,
                background: `linear-gradient(90deg, #0ff 0%, #f0f 50%, #ff0 100%)`,
                boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)'
              }}
            />
          </div>
          
          <button
            onClick={shootBall}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-lg font-bold text-black transition-all duration-300 transform hover:scale-105"
            style={{ 
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '14px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
            }}
          >
            SPARA! 🚀
          </button>
        </div>
      )}

      {/* Istruzioni */}
      <div className="mt-4 text-center">
        <p className="nike-text text-xs text-white/60" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          🎯 MIRA AL CANESTRO CON TABELLONE! EVITA I FULMINI! ⚡
        </p>
      </div>
    </div>
  );
};

export default BasketballChallenge;
