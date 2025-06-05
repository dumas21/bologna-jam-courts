
import React from 'react';

interface GameControlsProps {
  gameOver: boolean;
  isShooting: boolean;
  score: number;
  onShoot: () => void;
  onReset: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameOver,
  isShooting,
  score,
  onShoot,
  onReset
}) => {
  if (!gameOver) {
    return (
      <button
        onClick={onShoot}
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
    );
  }

  return (
    <div style={styles.gameOverContainer}>
      <div style={styles.gameOverText}>
        {score >= 20 ? '🏆 LEGGENDARIO!' : score >= 15 ? '🔥 FANTASTICO!' : score >= 10 ? '⭐ BRAVO!' : '💪 RIPROVA!'}
      </div>
      <div style={styles.finalScore}>PUNTEGGIO FINALE: {score}</div>
      <button onClick={onReset} style={styles.restartButton}>
        🔄 RICOMINCIA
      </button>
    </div>
  );
};

const styles = {
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
  }
};

export default GameControls;
