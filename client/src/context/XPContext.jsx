import React, { createContext, useState, useContext } from 'react';

const XPContext = createContext();

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXP must be used within XPProvider');
  }
  return context;
};

export const XPProvider = ({ children }) => {
  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    streak: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  const XP_PER_LEVEL = 100;

  const calculateLevel = (totalXP) => {
    return Math.floor(totalXP / XP_PER_LEVEL) + 1;
  };

  const getXPToNextLevel = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    const nextLevelXP = currentLevel * XP_PER_LEVEL;
    return nextLevelXP - currentXP;
  };

  const getCurrentLevelXP = (totalXP) => {
    const currentLevel = calculateLevel(totalXP);
    const levelStartXP = (currentLevel - 1) * XP_PER_LEVEL;
    return totalXP - levelStartXP;
  };

  const getProgressPercentage = (currentXP) => {
    const currentLevelXP = getCurrentLevelXP(currentXP);
    const progressPercentage = (currentLevelXP / XP_PER_LEVEL) * 100;
    return Math.min(progressPercentage, 100);
  };

  const updateStats = (stats) => {
    setUserStats(stats);
  };

  const value = {
    userStats,
    updateStats,
    calculateLevel,
    getXPToNextLevel,
    getCurrentLevelXP,
    getProgressPercentage,
    XP_PER_LEVEL
  };

  return (
    <XPContext.Provider value={value}>
      {children}
    </XPContext.Provider>
  );
};
