// 解锁状态管理工具

const UNLOCK_DURATION = 24 * 60 * 60 * 1000; // 24小时（毫秒）

/**
 * 检查内容是否已解锁
 */
export const isContentUnlocked = (): boolean => {
  const unlockData = localStorage.getItem('contentUnlocked');
  if (!unlockData) return false;
  
  try {
    const { timestamp } = JSON.parse(unlockData);
    const now = Date.now();
    
    // 检查是否过期
    if (now - timestamp > UNLOCK_DURATION) {
      localStorage.removeItem('contentUnlocked');
      return false;
    }
    
    return true;
  } catch (error) {
    // 如果解析失败，清除无效数据
    localStorage.removeItem('contentUnlocked');
    return false;
  }
};

/**
 * 设置解锁状态
 */
export const setContentUnlocked = (unlocked: boolean): void => {
  if (unlocked) {
    const unlockData = {
      timestamp: Date.now()
    };
    localStorage.setItem('contentUnlocked', JSON.stringify(unlockData));
  } else {
    localStorage.removeItem('contentUnlocked');
  }
};

/**
 * 清除解锁状态
 */
export const clearUnlockStatus = (): void => {
  localStorage.removeItem('contentUnlocked');
};

/**
 * 获取解锁状态（用于显示）
 */
export const getUnlockStatus = (): string => {
  return isContentUnlocked() ? '已解锁' : '未解锁';
};

/**
 * 获取剩余解锁时间（小时）
 */
export const getRemainingUnlockTime = (): number => {
  const unlockData = localStorage.getItem('contentUnlocked');
  if (!unlockData) return 0;
  
  try {
    const { timestamp } = JSON.parse(unlockData);
    const now = Date.now();
    const remaining = UNLOCK_DURATION - (now - timestamp);
    
    if (remaining <= 0) {
      localStorage.removeItem('contentUnlocked');
      return 0;
    }
    
    return Math.ceil(remaining / (60 * 60 * 1000)); // 返回剩余小时数
  } catch (error) {
    localStorage.removeItem('contentUnlocked');
    return 0;
  }
}; 