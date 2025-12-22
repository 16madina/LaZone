import { useCallback, useRef } from 'react';

type SoundType = 'message' | 'notification' | 'startup' | 'success' | 'error' | 'stamp';

// Sound frequencies and durations for different notification types
const soundConfigs: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  message: {
    frequencies: [800, 1000, 800],
    durations: [100, 100, 150],
    type: 'sine'
  },
  notification: {
    frequencies: [523, 659, 784],
    durations: [150, 150, 200],
    type: 'sine'
  },
  startup: {
    frequencies: [392, 523, 659, 784],
    durations: [150, 150, 150, 300],
    type: 'sine'
  },
  success: {
    frequencies: [523, 784],
    durations: [100, 200],
    type: 'sine'
  },
  error: {
    frequencies: [200, 150],
    durations: [150, 200],
    type: 'square'
  },
  stamp: {
    frequencies: [150, 80, 60],
    durations: [30, 50, 80],
    type: 'square'
  }
};

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef<boolean>(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', startTime: number = 0) => {
    const audioContext = getAudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
    
    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime + startTime);
    oscillator.stop(audioContext.currentTime + startTime + duration / 1000);
  }, [getAudioContext]);

  const playSound = useCallback((soundType: SoundType) => {
    // Check if sounds are enabled
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    if (!soundEnabled || isMutedRef.current) return;

    try {
      const config = soundConfigs[soundType];
      let currentTime = 0;

      config.frequencies.forEach((freq, index) => {
        playTone(freq, config.durations[index], config.type, currentTime);
        currentTime += config.durations[index] / 1000;
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [playTone]);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    localStorage.setItem('soundEnabled', (!muted).toString());
  }, []);

  const isMuted = useCallback(() => {
    return localStorage.getItem('soundEnabled') === 'false';
  }, []);

  return {
    playSound,
    playMessageSound: () => playSound('message'),
    playNotificationSound: () => playSound('notification'),
    playStartupSound: () => playSound('startup'),
    playSuccessSound: () => playSound('success'),
    playErrorSound: () => playSound('error'),
    playStampSound: () => playSound('stamp'),
    setMuted,
    isMuted
  };
};

// Singleton for global sound access
let globalSoundInstance: ReturnType<typeof useSound> | null = null;

export const getSoundInstance = () => {
  if (!globalSoundInstance) {
    // Create a simple instance without hooks for use outside components
    const audioContextRef = { current: null as AudioContext | null };
    
    const getAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    };

    const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', startTime: number = 0) => {
      const audioContext = getAudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration / 1000);
    };

    const playSound = (soundType: SoundType) => {
      const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
      if (!soundEnabled) return;

      try {
        const config = soundConfigs[soundType];
        let currentTime = 0;

        config.frequencies.forEach((freq, index) => {
          playTone(freq, config.durations[index], config.type, currentTime);
          currentTime += config.durations[index] / 1000;
        });
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    };

    globalSoundInstance = {
      playSound,
      playMessageSound: () => playSound('message'),
      playNotificationSound: () => playSound('notification'),
      playStartupSound: () => playSound('startup'),
      playSuccessSound: () => playSound('success'),
      playErrorSound: () => playSound('error'),
      playStampSound: () => playSound('stamp'),
      setMuted: (muted: boolean) => localStorage.setItem('soundEnabled', (!muted).toString()),
      isMuted: () => localStorage.getItem('soundEnabled') === 'false'
    };
  }
  return globalSoundInstance;
};
