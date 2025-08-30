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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-yellow-400/15 to-amber-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-60 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main logo container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className={`relative transition-all duration-1000 ease-out ${
          animationPhase === 'enter' 
            ? 'scale-0 opacity-0 rotate-180' 
            : animationPhase === 'pulse'
            ? 'scale-100 opacity-100 rotate-0'
            : 'scale-110 opacity-0'
        }`}>
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-orange-500/30 rounded-full blur-xl scale-150 animate-pulse"></div>
          
          {/* Logo image */}
          <img
            src="/lovable-uploads/afc0b444-106c-4155-8e47-6bbadcb70189.png"
            alt="LaZone Logo"
            className={`relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl transition-all duration-500 ${
              animationPhase === 'pulse' ? 'animate-pulse' : ''
            }`}
          />
          
          {/* Rotating ring around logo */}
          <div className="absolute inset-0 border-2 border-amber-400 rounded-full animate-spin opacity-50"></div>
          <div className="absolute inset-2 border border-amber-300/30 rounded-full animate-spin-reverse opacity-30"></div>
        </div>

        {/* Loading text */}
        <div className={`mt-8 transition-all duration-700 delay-500 ${
          animationPhase === 'enter'
            ? 'opacity-0 translate-y-4'
            : animationPhase === 'pulse'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2'
        }`}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
            LaZone
          </h1>
          <p className="text-slate-300 text-sm md:text-base text-center font-light tracking-wide">
            Votre plateforme immobilière de confiance
          </p>
        </div>

        {/* Loading animation */}
        <div className={`mt-6 transition-all duration-700 delay-700 ${
          animationPhase === 'enter'
            ? 'opacity-0 translate-y-4'
            : animationPhase === 'pulse'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0'
        }`}>
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-500/10 to-transparent"></div>
    </div>
  );
}