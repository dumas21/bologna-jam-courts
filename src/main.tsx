
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

document.addEventListener('DOMContentLoaded', () => {
  // Initialize audio context for sound effects when user interacts
  window.addEventListener('click', initAudioContext, { once: true });
  window.addEventListener('touchstart', initAudioContext, { once: true });
  
  const root = createRoot(document.getElementById('root')!);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});

// Initialize audio context to enable sound effects
function initAudioContext() {
  try {
    // Use standard AudioContext instead of webkitAudioContext
    const AudioContext = window.AudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      console.log('Audio context initialized successfully');
      
      // Create a short sound to "wake up" audio on iOS
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0; // Mute the sound
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(0.001);
    }
  } catch (e) {
    console.log('Could not initialize audio context', e);
  }
}
