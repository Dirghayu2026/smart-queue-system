import React, { useState, useEffect } from 'react';
import { PURPOSES, STATUS_CONFIG } from '../utils/constants';
import { formatWaitTime } from '../utils/helpers';
import ToastNotification from './ToastNotification';

const VisitorPanel = ({ 
  onJoinQueue, 
  visitorToken, 
  queueData, 
  currentServing,
  isLunchBreak,
  lunchCountdown,
  adminStatus
}) => {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lastStatus, setLastStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !purpose) {
      setToastMessage('Please enter name and select purpose');
      setShowToast(true);
      return;
    }
    onJoinQueue(name, purpose);
    setName('');
    setPurpose('');
    setToastMessage('Successfully joined the queue!');
    setShowToast(true);
  };

  // Monitor status changes for toast notifications
  useEffect(() => {
    if (queueData) {
      let currentStatus = 'waiting';
      if (currentServing === visitorToken) currentStatus = 'turn';
      else if (queueData.position === 1) currentStatus = 'almost';
      else if (queueData.position <= 5) currentStatus = 'upcoming';
      
      if (lastStatus && lastStatus !== currentStatus) {
        const statusMsg = STATUS_CONFIG[currentStatus]?.label || 'Status Updated';
        setToastMessage(`Your status: ${statusMsg}!`);
        setShowToast(true);
      }
      setLastStatus(currentStatus);
    }
  }, [queueData, currentServing, visitorToken, lastStatus]);

  const getStatusInfo = () => {
    if (!visitorToken) return null;
    if (currentServing === visitorToken) return STATUS_CONFIG.turn;
    if (queueData?.position === 1) return STATUS_CONFIG.almost;
    if (queueData?.position <= 5) return STATUS_CONFIG.upcoming;
    return STATUS_CONFIG.waiting;
  };

  const statusInfo = getStatusInfo();
  const progressPercent = queueData ? ((queueData.position - 1) / (queueData.position + 5) * 100) : 0;

  return (
    <div className="container">
      {!visitorToken ? (
        // Join Form
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
            🎫 Join Virtual Queue
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '30px', color: '#b0b0b0' }}>
            Accounts Section
          </p>

          {isLunchBreak && (
            <div style={{
              background: '#2a1a0a',
              border: '1px solid #f5a623',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span>🍽️ Lunch Break • Resumes in {Math.floor(lunchCountdown / 60)}:{String(lunchCountdown % 60).padStart(2, '0')}</span>
              <p style={{ fontSize: '12px', marginTop: '5px' }}>You can still join - your spot will be saved!</p>
            </div>
          )}

          {adminStatus === 'break' && !isLunchBreak && (
            <div style={{
              background: '#2a1a1a',
              border: '1px solid #ff6b35',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              ⏸️ Staff on break - Queue is accepting tokens
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                marginBottom: '15px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px'
              }}
            />
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Purpose of Visit
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {PURPOSES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPurpose(p.label)}
                    style={{
                      padding: '10px 16px',
                      background: purpose === p.label ? p.color : '#2a2a2a',
                      border: 'none',
                      borderRadius: '30px',
                      color: purpose === p.label ? '#000' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
              Get Token →
            </button>
          </form>
        </div>
      ) : (
        // Live Status Dashboard
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="token-number" style={{ 
              fontSize: '64px', 
              color: '#f5a623',
              letterSpacing: '4px'
            }}>
              {visitorToken}
            </div>
            <p style={{ color: '#b0b0b0' }}>Your Token Number</p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '30px',
            borderRadius: '12px',
            background: statusInfo ? `rgba(${parseInt(statusInfo.color.slice(1,3), 16)}, ${parseInt(statusInfo.color.slice(3,5), 16)}, ${parseInt(statusInfo.color.slice(5,7), 16)}, 0.1)` : '#1a1a1a',
            marginBottom: '25px',
            border: statusInfo ? `2px solid ${statusInfo.color}` : '1px solid #333'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>{statusInfo?.icon || '⏳'}</div>
            <h2 style={{ 
              color: statusInfo?.color || '#fff',
              fontSize: '28px'
            }}>
              {statusInfo?.label || 'Waiting'}
            </h2>
            {currentServing === visitorToken && (
              <div className="glow-effect" style={{ marginTop: '15px' }}>
                <button className="btn btn-success" style={{ fontSize: '18px' }}>
                  🏃 Go to Counter Now!
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: '#1a1a1a', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>Now Serving</div>
              <div className="token-number" style={{ fontSize: '32px', color: '#00ff88' }}>
                {currentServing || '---'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#1a1a1a', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>People Ahead</div>
              <div className="token-number" style={{ fontSize: '32px', color: '#f5a623' }}>
                {queueData?.ahead || 0}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Queue Progress</span>
              <span>{queueData?.position ? `${queueData.position}${queueData.position === 1 ? 'st' : queueData.position === 2 ? 'nd' : queueData.position === 3 ? 'rd' : 'th'} in line` : 'Position unknown'}</span>
            </div>
            <div style={{ background: '#2a2a2a', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, progressPercent)}%`,
                height: '8px',
                background: '#f5a623',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '15px', background: '#1a1a1a', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>Estimated Wait Time</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00b4d8' }}>
              {formatWaitTime(queueData?.waitTime || 0)}
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="btn"
            style={{ width: '100%', marginTop: '20px', background: '#2a2a2a' }}
          >
            Get New Token
          </button>
        </div>
      )}

      {showToast && (
        <ToastNotification 
          message={toastMessage} 
          type={toastMessage.includes('Success') ? 'success' : 'warning'}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default VisitorPanel;