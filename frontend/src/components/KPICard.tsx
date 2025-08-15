import { motion } from 'framer-motion';

export default function KPICard({title, value, hint}: {title: string; value: string; hint?: string}) {
  return (
    <motion.div 
      initial={{opacity: 0, y: 20}} 
      animate={{opacity: 1, y: 0}} 
      transition={{duration: 0.4, ease: "easeOut"}}
      whileHover={{y: -8, scale: 1.02}}
      className="financial-card metric-card rounded-2xl p-6 shadow-lg"
    >
      <div className="text-gray-600 text-sm font-medium mb-2">{title}</div>
      <div className="text-3xl font-bold text-gray-900 tabular-nums mb-2">{value}</div>
      {hint && <div className="text-xs text-gray-500 font-medium">{hint}</div>}
    </motion.div>
  );
}