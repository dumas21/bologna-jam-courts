
import { useCallback } from 'react';

export const useAudioEffects = () => {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const playSoundEffect = useCallback((action: string) => {
    try {
      // Check if audio is supported
      if (typeof Audio === 'undefined') {
        console.log('Audio not supported in this environment');
        return;
      }

      const audio = new Audio(`/sounds/${action}.mp3`);
      
      // Set volume to a reasonable level
      audio.volume = 0.3;
      
      // Add error handling for audio playback
      audio.addEventListener('error', (e) => {
        console.log(`Audio file not found or cannot be played: /sounds/${action}.mp3`);
      });
      
      // Play with promise handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Audio playback prevented by browser policy or file not found:', err.message);
        });
      }
    } catch (error) {
      console.log('Error initializing audio:', error);
    }
  }, []);

  return {
    scrollToTop,
    playSoundEffect
  };
};
