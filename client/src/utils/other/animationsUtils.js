import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

/**
 * Creates an animated fire emoji element for streak celebrations
 * @param {boolean} isVisible - Controls the visibility of the fire animation
 * @returns {JSX.Element|null} A motion-animated fire emoji that scales and fades
 */
export const createFireElement = (isVisible) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="text-2xl inline-block"
            animate={{
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 0.4,
              repeat: 3,
              ease: 'easeInOut'
            }}
          >
            🔥
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
