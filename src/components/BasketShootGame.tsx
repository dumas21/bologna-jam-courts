
import React, { useState, useEffect, useRef } from 'react';

const BasketShootGame = () => {
  const [ballPosition, setBallPosition] = useState(0); // Posizione orizzontale della palla (0-100%)
  const [direction, setDirection] = useState(1); // Direzione movimento: 1 = destra, -1 = sinistra
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [missAnimation, setMissAnimation] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const basketPosition = 50; // Posizione fissa del canestro al centro (50%)
  const basketWidth = 15; // Larghezza area canestro

  // Movimento continuo della palla
  useEffect(() => {
    if (gameOver || isShooting) return;

    intervalRef.current = setInterval(() => {
      setBallPosition((pos) => {
        let next = pos + direction * (2 + score * 0.1); // Velocità aumenta con il punteggio
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
    
    // Controlla se la palla è nella zona del canestro
    const basketStart = basketPosition - basketWidth/2;
    const basketEnd = basketPosition + basketWidth/2;
    const isGoal = ballPosition >= basketStart && ballPosition <= basketEnd;

    if (isGoal) {
      setScore(score + 1);
      createParticles();
      
      // Suono di successo (se disponibile)
      try {
        const audio = new Audio('/sounds/score.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    } else {
      setMissAnimation(true);
      setTimeout(() => setMissAnimation(false), 600);
      
      // Suono di errore (se disponibile)
      try {
        const audio = new Audio('/sounds/miss.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }

    // Reset posizione dopo il tiro
    setTimeout(() => {
      setIsShooting(false);
      setBallPosition(50); // Riporta la palla al centro
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
      
      {/* Stats Display */}
      <div style={styles.statsContainer}>
        <div style={styles.score}>SCORE: {score}</div>
        <div style={styles.timer}>TIME: {timeLeft}s</div>
      </div>

      {/* Game Area */}
      <div style={styles.gameArea}>
        {/* Canestro semicircolare */}
        <div style={{
          ...styles.hoop,
          boxShadow: gameOver ? styles.hoop.boxShadow : '0 0 15px #FFFF00, inset 0 0 10px rgba(255, 255, 0, 0.2)'
        }}>
          {/* Rete del canestro */}
          <div style={styles.net}>||||||||</div>
        </div>

        {/* Zona target pulsante */}
        <div style={{
          ...styles.targetZone,
          left: `${basketPosition - basketWidth/2}%`,
          width: `${basketWidth}%`,
          animation: gameOver ? 'none' : 'pulse 2s infinite'
        }} />

        {/* Linea guida tratteggiata */}
        <div style={styles.guideLine} />

        {/* Palla con scia neon */}
        <div style={{
          ...styles.ball,
          left: `${ballPosition}%`,
          bottom: isShooting ? '60%' : '15%',
          boxShadow: `0 0 15px #FF00FF, 0 0 30px #FF00FF${!gameOver && !isShooting ? ', -10px 0 20px rgba(255, 0, 255, 0.3)' : ''}`,
          transform: `translateX(-50%) ${missAnimation ? 'rotate(360deg)' : 'rotate(0deg)'}`,
          transition: isShooting ? 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'left 0.05s linear, transform 0.6s ease'
        }}>
          🏀
        </div>

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

      {/* Controlli */}
      {!gameOver ? (
        <button
          onClick={handleShoot}
          disabled={isShooting}
          style={{
            ...styles.shootButton,
            backgroundColor: isShooting ? '#333' : '#FF00FF',
            boxShadow: isShooting ? 'none' : '0 0 20px #FF00FF',
            cursor: isShooting ? 'not-allowed' : 'pointer'
          }}
        >
          {isShooting ? '🚀 SHOOTING...' : '🚀 TIRA!'}
        </button>
      ) : (
        <div style={styles.gameOverContainer}>
          <div style={styles.gameOverText}>
            {score >= 20 ? '🏆 LEGGENDARIO!' : score >= 15 ? '🔥 FANTASTICO!' : score >= 10 ? '⭐ BRAVO!' : '💪 RIPROVA!'}
          </div>
          <div style={styles.finalScore}>PUNTEGGIO FINALE: {score}</div>
          <button onClick={resetGame} style={styles.restartButton}>
            🔄 RICOMINCIA
          </button>
        </div>
      )}

      {/* Istruzioni */}
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
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '300px',
    marginBottom: '20px'
  },
  score: {
    color: '#FFFF00',
    fontSize: 'clamp(0.6rem, 3vw, 0.8rem)',
    textShadow: '0 0 10px #FFFF00'
  },
  timer: {
    color: '#8A2BE2',
    fontSize: 'clamp(0.6rem, 3vw, 0.8rem)',
    textShadow: '0 0 10px #8A2BE2'
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
  hoop: {
    position: 'absolute' as const,
    top: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'clamp(60px, 15vw, 80px)',
    height: 'clamp(30px, 7.5vw, 40px)',
    border: '4px solid #FFFF00',
    borderTop: 'none',
    borderRadius: '0 0 50px 50px',
    backgroundColor: 'transparent',
    boxShadow: '0 0 15px #FFFF00'
  },
  net: {
    position: 'absolute' as const,
    bottom: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#FFFFFF',
    fontSize: 'clamp(8px, 2vw, 12px)',
    textShadow: '0 0 5px #FFFFFF',
    letterSpacing: '1px'
  },
  targetZone: {
    position: 'absolute' as const,
    bottom: '80px',
    height: '20px',
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
    border: '2px dashed #FF00FF',
    borderRadius: '5px'
  },
  guideLine: {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    borderTop: '1px dashed #00FFFF'
  },
  ball: {
    position: 'absolute' as const,
    fontSize: 'clamp(20px, 5vw, 28px)',
    filter: 'drop-shadow(0 0 10px #FF00FF)',
    zIndex: 5
  },
  shootButton: {
    backgroundColor: '#FF00FF',
    border: '3px solid #FFFFFF',
    color: '#000000',
    padding: 'clamp(12px, 3vw, 18px) clamp(24px, 6vw, 36px)',
    fontSize: 'clamp(0.7rem, 3vw, 0.9rem)',
    cursor: 'pointer',
    borderRadius: '8px',
    margin: '20px 0',
    boxShadow: '0 0 20px #FF00FF',
    transition: 'all 0.3s ease',
    fontFamily: "'Press Start 2P', monospace",
    textTransform: 'uppercase' as const,
    minWidth: '150px'
  },
  gameOverContainer: {
    backgroundColor: 'rgba(26, 0, 51, 0.9)',
    padding: '20px',
    borderRadius: '10px',
    border: '3px solid #FF00FF',
    boxShadow: '0 0 30px #FF00FF',
    margin: '20px 0'
  },
  gameOverText: {
    color: '#FFFF00',
    fontSize: 'clamp(0.8rem, 4vw, 1.2rem)',
    textShadow: '0 0 15px #FFFF00',
    marginBottom: '15px'
  },
  finalScore: {
    color: '#00FFFF',
    fontSize: 'clamp(0.7rem, 3vw, 1rem)',
    textShadow: '0 0 10px #00FFFF',
    marginBottom: '20px'
  },
  restartButton: {
    backgroundColor: '#00FFFF',
    border: '3px solid #FFFFFF',
    color: '#000000',
    padding: 'clamp(12px, 3vw, 15px) clamp(20px, 5vw, 30px)',
    fontSize: 'clamp(0.6rem, 2.5vw, 0.8rem)',
    cursor: 'pointer',
    borderRadius: '8px',
    boxShadow: '0 0 20px #00FFFF',
    transition: 'all 0.3s ease',
    fontFamily: "'Press Start 2P', monospace"
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
