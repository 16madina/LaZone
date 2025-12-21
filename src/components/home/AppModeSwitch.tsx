import { motion } from 'framer-motion';
import { Home, Building2 } from 'lucide-react';
import { useAppStore, AppMode } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface AppModeSwitchProps {
  onSwitch: (mode: AppMode) => void;
}

export const AppModeSwitch = ({ onSwitch }: AppModeSwitchProps) => {
  const { appMode } = useAppStore();
  const isResidence = appMode === 'residence';

  const handleSwitch = () => {
    const newMode = isResidence ? 'lazone' : 'residence';
    onSwitch(newMode);
  };

  return (
    <motion.button
      onClick={handleSwitch}
      className={cn(
        "relative flex items-center gap-2 px-3 py-1.5 rounded-full",
        "backdrop-blur-xl border transition-all duration-300",
        "text-xs font-medium",
        isResidence 
          ? "bg-emerald-500/20 border-emerald-400/30 text-white hover:bg-emerald-500/30"
          : "bg-white/20 border-white/30 text-white hover:bg-white/30"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isResidence ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {isResidence ? (
          <Building2 className="w-3.5 h-3.5" />
        ) : (
          <Home className="w-3.5 h-3.5" />
        )}
      </motion.div>
      
      <span className="hidden sm:inline">
        {isResidence ? 'Residence' : 'Immobilier'}
      </span>
      
      {/* Animated switch indicator */}
      <div className="relative w-8 h-4 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute top-0.5 w-3 h-3 rounded-full",
            isResidence ? "bg-emerald-400" : "bg-white"
          )}
          initial={false}
          animate={{ x: isResidence ? 17 : 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
    </motion.button>
  );
};