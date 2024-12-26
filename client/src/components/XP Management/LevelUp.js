import { useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const LevelUpNoti = ({ level }) => {
  const { addNotification } = useNotification();

  useEffect(() => {
    if (level && level > 1) {
      addNotification(
        `🎉 Let's go! You've reached Level ${level}!`,
        'achievement'
      );
    }
  }, [level, addNotification]);

  return null;
};

export default LevelUpNoti;
