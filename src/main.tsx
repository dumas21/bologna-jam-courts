
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize audio context for sound effects when user interacts
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

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize audio context for sound effects when user interacts
    window.addEventListener('click', initAudioContext, { once: true });
    window.addEventListener('touchstart', initAudioContext, { once: true });
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Fallback rendering
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; font-family: monospace;">
        <div style="text-align: center;">
          <h1>Errore di caricamento</h1>
          <p>Ricarica la pagina per riprovare</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: orange; color: white; border: none; cursor: pointer;">
            RICARICA
          </button>
        </div>
      </div>
    `;
  }
});
