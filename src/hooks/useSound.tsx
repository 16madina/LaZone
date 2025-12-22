import { useCallback, useRef } from 'react';

type SoundType = 'message' | 'notification' | 'startup' | 'success' | 'error' | 'stamp';

// Sound frequencies and durations for different notification types
const soundConfigs: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType; gains?: number[] }> = {
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
  // Stamp sound - simulates a rubber stamp hitting paper
  stamp: {
    frequencies: [120, 80, 40, 30],
    durations: [20, 40, 60, 100],
    type: 'square',
    gains: [0.5, 0.4, 0.3, 0.2]
  }
};

// Play realistic stamp sound with noise component
const playStampSound = (audioContext: AudioContext) => {
  const now = audioContext.currentTime;
  
  // Create noise buffer for paper/thud texture
  const bufferSize = audioContext.sampleRate * 0.15;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  // Noise source for paper texture
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  
  // Filter noise to make it sound more like paper
  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(800, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.1);
  
  // Noise gain envelope
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  
  // Deep thump oscillator
  const thump = audioContext.createOscillator();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(150, now);
  thump.frequency.exponentialRampToValueAtTime(40, now + 0.08);
  
  const thumpGain = audioContext.createGain();
  thumpGain.gain.setValueAtTime(0.6, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  thump.connect(thumpGain);
  thumpGain.connect(audioContext.destination);
  
  // Click/impact oscillator
  const click = audioContext.createOscillator();
  click.type = 'square';
  click.frequency.setValueAtTime(300, now);
  click.frequency.exponentialRampToValueAtTime(80, now + 0.03);
  
  const clickGain = audioContext.createGain();
  clickGain.gain.setValueAtTime(0.4, now);
  clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
  
  click.connect(clickGain);
  clickGain.connect(audioContext.destination);
  
  // Start all sounds
  noiseSource.start(now);
  thump.start(now);
  click.start(now);
  
  // Stop all sounds
  noiseSource.stop(now + 0.15);
  thump.stop(now + 0.12);
  click.stop(now + 0.05);
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
      const audioContext = getAudioContext();
      
      // Special handling for stamp sound
      if (soundType === 'stamp') {
        playStampSound(audioContext);
        return;
      }
      
      const config = soundConfigs[soundType];
      let currentTime = 0;

      config.frequencies.forEach((freq, index) => {
        playTone(freq, config.durations[index], config.type, currentTime);
        currentTime += config.durations[index] / 1000;
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [playTone, getAudioContext]);

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
        const audioContext = getAudioContext();
        
        // Special handling for stamp sound
        if (soundType === 'stamp') {
          playStampSound(audioContext);
          return;
        }
        
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
