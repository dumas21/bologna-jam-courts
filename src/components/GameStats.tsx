
import React from 'react';

interface GameStatsProps {
  score: number;
  timeLeft: number;
}

const GameStats: React.FC<GameStatsProps> = ({ score, timeLeft }) => {
  return (
    <div style={styles.statsContainer}>
      <div style={styles.score}>SCORE: {score}</div>
      <div style={styles.timer}>TIME: {timeLeft}s</div>
    </div>
  );
};

const styles = {
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
  }
};

export default GameStats;
