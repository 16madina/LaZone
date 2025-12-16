import { motion } from 'framer-motion';
import { TrendingUp, Home, Users, MapPin } from 'lucide-react';

const stats = [
  { icon: Home, value: '2,450', label: 'Propriétés', color: 'text-primary' },
  { icon: Users, value: '1,200+', label: 'Agents', color: 'text-secondary' },
  { icon: MapPin, value: '50+', label: 'Villes', color: 'text-accent' },
  { icon: TrendingUp, value: '+15%', label: 'Ce mois', color: 'text-primary' },
];

export const StatsSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="grid grid-cols-4 gap-2"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
          className="stat-card"
        >
          <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
          <p className="font-display font-bold text-sm">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};
