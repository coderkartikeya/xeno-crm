import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <motion.div
          className="relative w-20 h-20 mx-auto mb-4"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
          <motion.div
            className="absolute inset-0 border-4 border-blue-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-medium text-gray-700 dark:text-gray-300"
        >
          Loading your dashboard...
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500 dark:text-gray-400 mt-2"
        >
          Please wait while we prepare your workspace
        </motion.div>
      </div>
    </div>
  );
} 