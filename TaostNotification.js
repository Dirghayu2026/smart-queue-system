import React, { useEffect, useState } from 'react';

const ToastNotification = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '🔔';
    }
  };

  const getColor = () => {
    switch(type) {
      case 'success': return '#00ff88';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#f5a623';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1a1a1a',
      borderLeft: `4px solid ${getColor()}`,
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
      zIndex: 2000,
      animation: 'slideIn 0.3s ease',
      minWidth: '250px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>{getIcon()}</span>
        <span style={{ color: 'white', fontSize: '14px' }}>{message}</span>
      </div>
    </div>
  );
};

export default ToastNotification;