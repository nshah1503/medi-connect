import React, { createContext, useContext, useState } from 'react';

// Create context with default values
const AvatarContext = createContext({
  avatars: [],
  activeAvatar: null,
  setAvatars: () => {},
  setActiveAvatar: () => {},
});

// Provider component
export const AvatarProvider = ({ children }) => {
  const [avatars, setAvatars] = useState([
    {
      name: 'MindMeld',
      visual: 'doctor',
      prosody: { neutral: 1 }
    }
  ]);
  const [activeAvatar, setActiveAvatar] = useState('MindMeld');

  return (
    <AvatarContext.Provider 
      value={{ 
        avatars, 
        activeAvatar, 
        setAvatars, 
        setActiveAvatar 
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

// Custom hook to use avatar context
export const useAvatars = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatars must be used within an AvatarProvider');
  }
  return context;
};