import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'pulse' | 'exit'>('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('pulse');
    }, 1000);

    const timer2 = setTimeout(() => {
      setAnimationPhase('exit');
    }, 2500);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-card to-muted flex items-center justify-center overflow-hidden">
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-20 h-20 border border-primary/30 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-primary/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo container */}
        <div className={`relative transition-all duration-1000 ease-out ${
          animationPhase === 'enter' 
            ? 'scale-90 opacity-0 translate-y-4' 
            : animationPhase === 'pulse'
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-2'
        }`}>
          {/* Subtle glow */}
          <div className="absolute -inset-4 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-xl"></div>
          
          {/* Logo */}
          <div className="relative">
            <img
              src="/lovable-uploads/83c5d50b-f3ab-4fc9-b897-2f44c7023df8.png"
              alt="LaZone Logo"
              className="relative w-32 h-32 md:w-40 md:h-40 object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Text */}
        <div className={`mt-8 transition-all duration-800 delay-300 ${
          animationPhase === 'enter'
            ? 'opacity-0 translate-y-4'
            : animationPhase === 'pulse'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2'
        }`}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 text-center">
            LaZone
          </h1>
          <p className="text-muted-foreground text-base md:text-lg text-center font-light max-w-md">
            Immobilier Panafricain
          </p>
        </div>

        {/* Simple progress dots */}
        <div className={`mt-12 transition-all duration-800 delay-600 ${
          animationPhase === 'enter'
            ? 'opacity-0 translate-y-4'
            : animationPhase === 'pulse'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0'
        }`}>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}