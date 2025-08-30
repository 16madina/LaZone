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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated rays of light */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-transparent via-blue-400/20 to-transparent origin-bottom"
            style={{
              height: '200vh',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              animation: `spin 20s linear infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Floating blue particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animation: `float 6s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main logo container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with enhanced animation */}
        <div className={`relative transition-all duration-1500 ease-out ${
          animationPhase === 'enter' 
            ? 'scale-0 opacity-0 rotate-45 blur-sm' 
            : animationPhase === 'pulse'
            ? 'scale-100 opacity-100 rotate-0 blur-0'
            : 'scale-125 opacity-0 rotate-12'
        }`}>
          {/* Multiple glow layers for depth */}
          <div className="absolute -inset-8 bg-gradient-radial from-blue-400/40 via-blue-500/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -inset-4 bg-gradient-radial from-blue-300/30 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Logo image with enhanced effects */}
          <div className="relative">
            <img
              src="/lovable-uploads/83c5d50b-f3ab-4fc9-b897-2f44c7023df8.png"
              alt="LaZone Logo"
              className={`relative w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl transition-all duration-1000 ${
                animationPhase === 'pulse' ? 'animate-pulse filter brightness-110' : ''
              }`}
              style={{
                filter: animationPhase === 'pulse' ? 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6))' : ''
              }}
            />
            
            {/* Subtle rotating ring */}
            <div className="absolute inset-0 border border-blue-400/30 rounded-full animate-spin-slow opacity-60"></div>
          </div>
        </div>

        {/* Enhanced text with stagger animation */}
        <div className={`mt-10 transition-all duration-1000 delay-700 ${
          animationPhase === 'enter'
            ? 'opacity-0 translate-y-8 blur-sm'
            : animationPhase === 'pulse'
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent mb-3 text-center">
            LaZone
          </h1>
          <p className="text-gray-300 text-base md:text-lg text-center font-light tracking-wider max-w-md">
            Votre plateforme immobilière de confiance
          </p>
        </div>

        {/* Elegant progress indicator */}
        <div className={`mt-8 transition-all duration-1000 delay-1000 ${
          animationPhase === 'enter'
            ? 'opacity-0 translate-y-4'
            : animationPhase === 'pulse'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0'
        }`}>
          <div className="w-32 h-0.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse" 
                 style={{ 
                   width: animationPhase === 'pulse' ? '100%' : '0%',
                   transition: 'width 2s ease-out'
                 }}>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-500/5 to-transparent"></div>
    </div>
  );
}