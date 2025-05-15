
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload sound effects
const soundEffects = [
  'click.mp3',
  'checkin.mp3',
  'checkout.mp3',
  'select.mp3',
  'tab.mp3',
  'message.mp3',
  'rating.mp3',
  'reset.mp3',
  'add.mp3'
];

// Preloading sounds in background
soundEffects.forEach(sound => {
  const audio = new Audio(`/sounds/${sound}`);
  audio.preload = 'auto';
  audio.load();
});

// Audio context handling (for iOS Safari)
document.addEventListener('click', function() {
  // Create and destroy AudioContext on first user interaction
  // This is needed for iOS Safari which blocks autoplay
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    const audioCtx = new AudioContext();
    audioCtx.close();
  }
}, { once: true });

createRoot(document.getElementById("root")!).render(<App />);
