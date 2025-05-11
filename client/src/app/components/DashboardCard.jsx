import { motion } from 'framer-motion';

export default function DashboardCard({ icon, title, value, color = 'indigo' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-start p-5 rounded-xl shadow bg-white dark:bg-gray-900 border-t-4 border-${color}-500 min-w-[180px]`}
    >
      <div className={`text-${color}-500 text-2xl mb-2`}>{icon}</div>
      <div className="text-gray-700 dark:text-gray-200 text-lg font-semibold mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    </motion.div>
  );
} 