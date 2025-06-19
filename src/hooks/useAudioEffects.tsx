
import { useEffect } from "react";

export const useAudioEffects = () => {
  // Play coin sound on load
  useEffect(() => {
    const audio = new Audio('/sounds/coin-insert.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.log('Audio playback error:', err));
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playbook error:', err));
  };

  return { scrollToTop, playSoundEffect };
};
