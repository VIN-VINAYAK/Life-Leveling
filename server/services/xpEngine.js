import { syncUserTitle } from './titleService.js';

/**
 * XP Engine - Handles all XP calculations
 * Level formula: 100 XP per level (level 1 = 0-99 XP, level 2 = 100-199 XP, etc.)
 */

export class XPEngine {
  // XP required for each level
  static XP_PER_LEVEL = 100;

  /**
   * Calculate level based on total XP
   */
  static calculateLevel(totalXP) {
    return Math.floor(totalXP / this.XP_PER_LEVEL) + 1;
  }

  /**
   * Calculate XP needed to reach next level
   */
  static getXPToNextLevel(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    const nextLevelXP = currentLevel * this.XP_PER_LEVEL;
    return nextLevelXP - currentXP;
  }

  /**
   * Calculate XP for the current level (progress in current level)
   */
  static getCurrentLevelXP(totalXP) {
    const currentLevel = this.calculateLevel(totalXP);
    const levelStartXP = (currentLevel - 1) * this.XP_PER_LEVEL;
    return totalXP - levelStartXP;
  }

  /**
   * Get difficulty multiplier
   */
  static getDifficultyMultiplier(difficulty) {
    const multipliers = {
      easy: 1,
      medium: 1.5,
      hard: 2
    };
    return multipliers[difficulty] || 1;
  }

  /**
   * Calculate final XP reward based on difficulty
   */
  static calculateXPReward(baseXP, difficulty) {
    const multiplier = this.getDifficultyMultiplier(difficulty);
    return Math.floor(baseXP * multiplier);
  }

  /**
   * Check and update streak
   */
  static async applyXP(user, xpGain) {
    const newTotalXP = user.xp + xpGain;
    user.xp = newTotalXP;
    user.level = this.calculateLevel(newTotalXP);
    await syncUserTitle(user);
    return user;
  }

  static updateStreak(user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.lastTaskDate) {
      user.streak = 1;
      user.lastTaskDate = new Date();
      return user.streak;
    }

    const lastTaskDate = new Date(user.lastTaskDate);
    lastTaskDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastTaskDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Task completed today, streak continues
      return user.streak;
    } else if (daysDiff === 1) {
      // Task completed yesterday, increment streak
      user.streak += 1;
      user.lastTaskDate = new Date();
      return user.streak;
    } else {
      // Streak broken, reset to 1
      user.streak = 1;
      user.lastTaskDate = new Date();
      return user.streak;
    }
  }
}
