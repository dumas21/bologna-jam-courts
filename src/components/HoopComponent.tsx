
import React from 'react';

interface HoopComponentProps {
  basketPosition: number;
  basketWidth: number;
  gameOver: boolean;
}

const HoopComponent: React.FC<HoopComponentProps> = ({
  basketPosition,
  basketWidth,
  gameOver
}) => {
  return (
    <>
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
    </>
  );
};

const styles = {
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
  }
};

export default HoopComponent;
