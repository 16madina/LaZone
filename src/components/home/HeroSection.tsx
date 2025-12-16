import { Sparkles } from 'lucide-react';
import logoLazone from '@/assets/logo-lazone.png';

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 mb-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary-foreground/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary-foreground/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary-foreground/80" />
          <span className="text-sm text-primary-foreground/80 font-medium">
            Découvrez votre futur chez-vous en Afrique
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-primary-foreground mb-2">
          Trouvez la propriété
          <br />
          <span className="text-primary-foreground/90">de vos rêves</span>
        </h1>

        <p className="text-primary-foreground/70 text-sm">
          Des milliers de propriétés disponibles en Afrique
        </p>
      </div>

      {/* Logo */}
      <div className="absolute right-4 bottom-4 opacity-40">
        <img src={logoLazone} alt="LaZone" className="w-20 h-auto" />
      </div>
    </div>
  );
};
