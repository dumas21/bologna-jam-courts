
import React, { useState, useEffect, useRef } from 'react';
import BallComponent from './BallComponent';
import HoopComponent from './HoopComponent';
import GameStats from './GameStats';
import GameControls from './GameControls';

const BasketShootGame = () => {
  const [ballPosition, setBallPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [missAnimation, setMissAnimation] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const basketPosition = 50;
  const basketWidth = 15;

  // Movimento continuo della palla
  useEffect(() => {
    if (gameOver || isShooting) return;

    intervalRef.current = setInterval(() => {
      setBallPosition((pos) => {
        let next = pos + direction * (2 + score * 0.1);
        if (next >= 90) {
          setDirection(-1);
          next = 90;
        } else if (next <= 10) {
          setDirection(1);
          next = 10;
        }
        return next;
      });
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [direction, gameOver, score, isShooting]);

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      setGameOver(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft, gameOver]);

  // Gestione particelle
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const createParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: i,
        x: basketPosition + (Math.random() - 0.5) * 20,
        y: 15 + Math.random() * 10
      });
    }
    setParticles(newParticles);
  };

  const handleShoot = () => {
    if (gameOver || isShooting) return;

    setIsShooting(true);
    
    const basketStart = basketPosition - basketWidth/2;
    const basketEnd = basketPosition + basketWidth/2;
    const isGoal = ballPosition >= basketStart && ballPosition <= basketEnd;

    if (isGoal) {
      setScore(score + 1);
      createParticles();
      
      try {
        const audio = new Audio('/sounds/score.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    } else {
      setMissAnimation(true);
      setTimeout(() => setMissAnimation(false), 600);
      
      try {
        const audio = new Audio('/sounds/miss.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }

    setTimeout(() => {
      setIsShooting(false);
      setBallPosition(50);
    }, 1000);
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setBallPosition(0);
    setDirection(1);
    setIsShooting(false);
    setMissAnimation(false);
    setParticles([]);
  };

  return (
    <div style={styles.gameContainer}>
      <h1 style={styles.title}>🏀 BASKET HOOP JAM</h1>
      
      <GameStats score={score} timeLeft={timeLeft} />

      <div style={styles.gameArea}>
        <HoopComponent 
          basketPosition={basketPosition}
          basketWidth={basketWidth}
          gameOver={gameOver}
        />

        <BallComponent
          ballPosition={ballPosition}
          isShooting={isShooting}
          missAnimation={missAnimation}
          gameOver={gameOver}
        />

        {/* Particelle quando si segna */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              color: '#FFFF00',
              fontSize: '16px',
              animation: 'sparkle 1s ease-out forwards',
              zIndex: 10
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      <GameControls
        gameOver={gameOver}
        isShooting={isShooting}
        score={score}
        onShoot={handleShoot}
        onReset={resetGame}
      />

      <div style={styles.instructions}>
        🎯 Clicca TIRA quando la palla è nella zona target!<br/>
        La velocità aumenta con il punteggio!
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          
          @keyframes sparkle {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            100% { transform: scale(1.5) rotate(360deg); opacity: 0; }
          }
          
          @keyframes glow {
            0%, 100% { text-shadow: 0 0 10px currentColor; }
            50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  gameContainer: {
    fontFamily: "'Press Start 2P', monospace",
    backgroundColor: '#000000',
    color: '#00FFFF',
    maxWidth: '100%',
    width: '100%',
    minHeight: '100vh',
    margin: '0 auto',
    padding: '10px',
    textAlign: 'center' as const,
    userSelect: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box' as const
  },
  title: {
    color: '#FF00FF',
    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
    textShadow: '0 0 15px #FF00FF',
    marginBottom: '20px',
    animation: 'glow 2s ease-in-out infinite'
  },
  gameArea: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '400px',
    height: 'clamp(250px, 50vh, 350px)',
    backgroundColor: '#1a1a1a',
    backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    border: '3px solid #00FFFF',
    borderRadius: '10px',
    margin: '20px 0',
    overflow: 'hidden',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1)'
  },
  instructions: {
    fontSize: 'clamp(0.5rem, 2.5vw, 0.7rem)',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.4,
    marginTop: '15px',
    padding: '0 20px',
    textAlign: 'center' as const
  }
};

export default BasketShootGame;
