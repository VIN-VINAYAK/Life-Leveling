export const getTitleForLevel = (level) => {
  if (level >= 50) return 'Grandmaster';
  if (level >= 30) return 'Legend';
  if (level >= 20) return 'Champion';
  if (level >= 15) return 'Achiever';
  if (level >= 10) return 'Explorer';
  if (level >= 5) return 'Apprentice';
  return 'Novice';
};

export const syncUserTitle = async (user) => {
  const title = getTitleForLevel(user.level || 1);
  if (user.title !== title) {
    user.title = title;
  }
  return user;
};
