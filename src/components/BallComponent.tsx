
import React from 'react';

interface BallComponentProps {
  ballPosition: number;
  isShooting: boolean;
  missAnimation: boolean;
  gameOver: boolean;
}

const BallComponent: React.FC<BallComponentProps> = ({
  ballPosition,
  isShooting,
  missAnimation,
  gameOver
}) => {
  return (
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
  );
};

const styles = {
  ball: {
    position: 'absolute' as const,
    fontSize: 'clamp(20px, 5vw, 28px)',
    filter: 'drop-shadow(0 0 10px #FF00FF)',
    zIndex: 5
  }
};

export default BallComponent;
