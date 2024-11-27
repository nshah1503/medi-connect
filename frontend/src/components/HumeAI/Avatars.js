import React from 'react';
import { useVoice } from '@humeai/voice-react';
import { useAvatars } from './AvatarProvider.js';
import { getFaceByEmotion } from '../utils/emotionalFaces.js';
import { motion, AnimatePresence } from 'framer-motion';

const Avatars = () => {
  const { avatars, activeAvatar } = useAvatars();
  const { fft } = useVoice();

  const averageFFT = fft.reduce((sum, value) => sum + value, 0) / fft.length;
  const activeScale = 0.75 + averageFFT * 1.25;
  const inactiveScale = 1;

  return (
    <div className="flex justify-center items-center space-x-4 p-4">
      {avatars.map(({ name, visual, prosody }, index) => {
        const isActive = activeAvatar === name;
        const topProsody = prosody ? Object.keys(prosody)[0] : 'neutral';
        const face = getFaceByEmotion(topProsody);

        return (
          <AnimatePresence key={name}>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: isActive ? activeScale : inactiveScale,
                opacity: isActive ? 1 : 0.7
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl">{face}</div>
              <span className="mt-2 font-semibold">{name}</span>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
};

export default Avatars;