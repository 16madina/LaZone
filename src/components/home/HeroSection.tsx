import { Sparkles } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const HeroSection = () => {
  return (
    <div 
      className="relative overflow-hidden rounded-3xl p-6 mb-6"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-white/80" />
          <span className="text-sm text-white/80 font-medium">
            Découvrez votre futur chez-vous en Afrique
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Trouvez la propriété
          <br />
          <span className="text-white/90">de vos rêves</span>
        </h1>

        <p className="text-white/70 text-sm">
          Des milliers de propriétés disponibles en Afrique
        </p>
      </div>
    </div>
  );
};
