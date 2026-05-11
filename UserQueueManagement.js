import { useState, useEffect, useCallback } from 'react';
import { generateToken, calculateWaitTime, formatTime } from '../utils/helpers';
import { LUNCH_START, LUNCH_END } from '../utils/constants';

export const useQueueManagement = (avgServiceTime = 5) => {
  const [queue, setQueue] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);
  const [adminStatus, setAdminStatus] = useState('available');
  const [activityLog, setActivityLog] = useState([]);
  const [isLunchBreak, setIsLunchBreak] = useState(false);
  const [lunchCountdown, setLunchCountdown] = useState(0);

  // Check lunch break status
  useEffect(() => {
    const checkLunchBreak = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isBreak = (hours === LUNCH_START) || (hours === LUNCH_END && minutes === 0);
      setIsLunchBreak(isBreak);
      
      if (isBreak && hours === LUNCH_START) {
        const endLunch = new Date();
        endLunch.setHours(LUNCH_END, 0, 0, 0);
        const diffSeconds = Math.max(0, Math.floor((endLunch - now) / 1000));
        setLunchCountdown(diffSeconds);
      } else {
        setLunchCountdown(0);
      }
    };
    
    checkLunchBreak();
    const interval = setInterval(checkLunchBreak, 1000);
    return () => clearInterval(interval);
  }, []);

  const addLog = useCallback((action, details) => {
    const logEntry = {
      id: Date.now(),
      timestamp: formatTime(new Date()),
      action,
      details
    };
    setActivityLog(prev => [logEntry, ...prev].slice(0, 100));
  }, []);

  const addToQueue = useCallback((name, purpose) => {
    if (!name.trim() || !purpose) return null;
    
    const newToken = generateToken(queue.length);
    const newVisitor = {
      id: Date.now(),
      token: newToken,
      name: name.trim(),
      purpose,
      joinTime: new Date(),
      estimatedWait: calculateWaitTime(queue.length + 1, avgServiceTime)
    };
    
    setQueue(prev => [...prev, newVisitor]);
    addLog('Joined Queue', `${name} (${newToken}) - ${purpose}`);
    return newToken;
  }, [queue, avgServiceTime, addLog]);

  const callNext = useCallback(() => {
    if (isLunchBreak) {
      addLog('Call Failed', 'Lunch break in progress');
      return false;
    }
    if (adminStatus === 'break') {
      addLog('Call Failed', 'Admin on break');
      return false;
    }
    if (queue.length === 0) {
      addLog('Call Failed', 'Queue empty');
      return false;
    }
    
    const nextVisitor = queue[0];
    const newQueue = queue.slice(1);
    setQueue(newQueue);
    setCurrentServing(nextVisitor.token);
    addLog('Called Next', `Token ${nextVisitor.token} - ${nextVisitor.name}`);
    setAdminStatus('busy');
    return true;
  }, [queue, adminStatus, isLunchBreak, addLog]);

  const completeService = useCallback(() => {
    if (!currentServing) return false;
    addLog('Service Complete', `Token ${currentServing} finished`);
    setCurrentServing(null);
    setAdminStatus('available');
    return true;
  }, [currentServing, addLog]);

  const updateAdminStatus = useCallback((status) => {
    if (isLunchBreak && status !== 'break') {
      addLog('Status Change Failed', 'Cannot change during lunch');
      return false;
    }
    setAdminStatus(status);
    addLog('Status Changed', `Admin is now ${status}`);
    return true;
  }, [isLunchBreak, addLog]);

  return {
    queue,
    currentServing,
    adminStatus,
    activityLog,
    isLunchBreak,
    lunchCountdown,
    addToQueue,
    callNext,
    completeService,
    updateAdminStatus,
    setQueue
  };
};