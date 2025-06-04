
import React, { useState, useEffect, useRef } from 'react';

const BasketShootGame = () => {
  const [ballPosition, setBallPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const basketPosition = 50; // Posizione fissa del canestro al centro
  const basketWidth = 15; // Larghezza area canestro

  useEffect(() => {
    if (gameOver) return;

    intervalRef.current = setInterval(() => {
      setBallPosition((pos) => {
        let next = pos + direction * (2 + score * 0.1); // Velocità aumenta con il punteggio
        if (next >= 100) {
          setDirection(-1);
          next = 100;
        } else if (next <= 0) {
          setDirection(1);
          next = 0;
        }
        return next;
      });
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [direction, gameOver, score]);

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

  // Effetto particelle
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
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 50
      });
    }
    setParticles(newParticles);
  };

  const handleShoot = () => {
    if (gameOver) return;

    const basketStart = basketPosition - basketWidth/2;
    const basketEnd = basketPosition + basketWidth/2;

    if (ballPosition >= basketStart && ballPosition <= basketEnd) {
      setScore(score + 1);
      setScoring(true);
      createParticles();
      
      // Suono di canestro (se disponibile)
      try {
        const audio = new Audio('/sounds/score.mp3');
        audio.play().catch(() => {});
      } catch (e) {}

      setTimeout(() => setScoring(false), 500);
    } else {
      // Suono di miss (se disponibile)
      try {
        const audio = new Audio('/sounds/miss.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setBallPosition(0);
    setDirection(1);
    setScoring(false);
    setParticles([]);
  };

  return (
    <div
      style={{
        fontFamily: "'Press Start 2P', cursive",
        backgroundColor: '#000',
        color: '#0ff',
        maxWidth: 500,
        margin: '20px auto',
        padding: 20,
        border: '4px solid #0ff',
        borderRadius: 12,
        textAlign: 'center',
        userSelect: 'none',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
      }}
    >
      <h2 style={{ 
        color: '#ff00ff', 
        textShadow: '0 0 10px #ff00ff',
        marginBottom: 20 
      }}>
        🏀 BASKET CHALLENGE
      </h2>
      
      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 20,
        fontSize: '12px'
      }}>
        <div style={{ color: '#ffff00', textShadow: '0 0 5px #ffff00' }}>
          PUNTEGGIO: {score}
        </div>
        <div style={{ color: '#ff0080', textShadow: '0 0 5px #ff0080' }}>
          TEMPO: {timeLeft}s
        </div>
      </div>

      {/* Campo da basket */}
      <div
        style={{
          position: 'relative',
          height: 200,
          backgroundColor: '#1a4d3a',
          backgroundImage: 'linear-gradient(90deg, #1a4d3a 0%, #2d7a57 100%)',
          border: '3px solid #fff',
          borderRadius: 10,
          margin: '20px 0',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Linee del campo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: '#fff',
          opacity: 0.8
        }} />
        
        {/* Cerchio centrale */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '60px',
          height: '60px',
          border: '2px solid #fff',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.6
        }} />

        {/* Canestro con struttura completa */}
        <div style={{
          position: 'absolute',
          left: `${basketPosition}%`,
          top: '20px',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}>
          {/* Tabellone */}
          <div style={{
            width: '50px',
            height: '35px',
            backgroundColor: '#fff',
            border: '3px solid #ff0080',
            borderRadius: '3px',
            marginBottom: '5px',
            boxShadow: scoring ? '0 0 20px #ffff00' : '0 0 10px #ff0080',
            transition: 'box-shadow 0.3s ease'
          }} />
          
          {/* Anello del canestro */}
          <div style={{
            width: '40px',
            height: '8px',
            backgroundColor: scoring ? '#ffff00' : '#ff0080',
            border: '2px solid #fff',
            borderRadius: '20px',
            marginLeft: '5px',
            boxShadow: scoring ? '0 0 15px #ffff00' : '0 0 8px #ff0080',
            transition: 'all 0.3s ease'
          }} />
          
          {/* Rete */}
          <div style={{
            position: 'absolute',
            left: '8px',
            top: '50px',
            color: '#fff',
            fontSize: '10px',
            textAlign: 'center',
            width: '34px',
            textShadow: '0 0 5px #fff',
            transform: scoring ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            ||||||||
          </div>
        </div>

        {/* Zona target visibile */}
        <div style={{
          position: 'absolute',
          left: `${basketPosition - basketWidth/2}%`,
          bottom: '40px',
          width: `${basketWidth}%`,
          height: '20px',
          backgroundColor: 'rgba(255, 0, 255, 0.3)',
          border: '2px dashed #ff00ff',
          borderRadius: '5px',
          animation: 'pulse 2s infinite'
        }} />

        {/* Palla da basket */}
        <div style={{
          position: 'absolute',
          left: `${ballPosition}%`,
          bottom: '60px',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          filter: 'drop-shadow(0 0 8px #ffaa00)',
          zIndex: 5,
          transition: 'left 0.05s ease'
        }}>
          🏀
        </div>

        {/* Giocatore */}
        <div style={{
          position: 'absolute',
          left: `${ballPosition}%`,
          bottom: '10px',
          transform: 'translateX(-50%)',
          fontSize: '20px',
          filter: 'drop-shadow(0 0 5px #00ff00)'
        }}>
          🏃‍♂️
        </div>

        {/* Particelle quando si segna */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              color: '#ffff00',
              fontSize: '16px',
              animation: 'sparkle 1s ease-out forwards',
              zIndex: 15
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
          style={{
            backgroundColor: '#ff00ff',
            border: '3px solid #fff',
            color: '#000',
            padding: '15px 30px',
            fontSize: '14px',
            cursor: 'pointer',
            borderRadius: 8,
            marginBottom: 15,
            boxShadow: '0 0 15px #ff00ff',
            transition: 'all 0.2s ease',
            fontFamily: "'Press Start 2P', cursive"
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          🚀 TIRA!
        </button>
      ) : (
        <div style={{ marginTop: 20 }}>
          <div style={{
            color: score >= 15 ? '#00ff00' : score >= 10 ? '#ffff00' : '#ff0080',
            fontSize: '16px',
            textShadow: '0 0 10px currentColor',
            marginBottom: 15
          }}>
            {score >= 15 ? '🏆 CAMPIONE!' : score >= 10 ? '⭐ BRAVO!' : '💪 RIPROVA!'}
          </div>
          <div style={{
            color: '#ffff00',
            fontWeight: 'bold',
            textShadow: '0 0 10px #ffff00',
            marginBottom: 15
          }}>
            Punteggio finale: {score}
          </div>
          <button
            onClick={resetGame}
            style={{
              marginTop: 10,
              padding: '12px 24px',
              fontFamily: "'Press Start 2P', cursive",
              backgroundColor: '#0ff',
              color: '#000',
              border: '3px solid #fff',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 0 15px #0ff',
              fontSize: '12px'
            }}
          >
            🔄 RICOMINCIA
          </button>
        </div>
      )}

      {/* Istruzioni */}
      <div style={{
        marginTop: 15,
        fontSize: '10px',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 1.4
      }}>
        🎯 Clicca quando la palla è nella zona target!<br/>
        La velocità aumenta con il punteggio!
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
          
          @keyframes sparkle {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            100% { transform: scale(1.5) rotate(360deg); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default BasketShootGame;
