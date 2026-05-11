import React, { useState } from 'react';
import { ADMIN_STATUSES } from '../utils/constants';
import { formatWaitTime } from '../utils/helpers';
import ActivityLog from './ActivityLog';
import QRCodeScanner from './QRCodeScanner';

const AdminPanel = ({ 
  queue, 
  currentServing, 
  adminStatus, 
  isLunchBreak,
  lunchCountdown,
  avgServiceTime,
  onAvgServiceTimeChange,
  onCallNext,
  onCompleteService,
  onStatusChange,
  activityLog,
  counterName
}) => {
  const [showQR, setShowQR] = useState(false);

  const getStatusBadge = (position, token) => {
    if (token === currentServing) return { label: 'SERVING', color: '#00ff88' };
    if (position === 1) return { label: 'NEXT', color: '#ff6b35' };
    if (position <= 3) return { label: 'SOON', color: '#f5a623' };
    return { label: 'WAITING', color: '#6c757d' };
  };

  return (
    <div className="container">
      <div className="grid-2cols">
        {/* Left Column */}
        <div>
          {/* Admin Status Controls */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>👨‍💼 Admin Control</h2>
            
            {isLunchBreak && (
              <div style={{
                background: '#2a1a0a',
                border: '1px solid #f5a623',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '30px' }}>🍽️</span>
                <h3>Lunch Break in Progress</h3>
                <div className="display-large" style={{ fontSize: '48px', color: '#f5a623' }}>
                  {Math.floor(lunchCountdown / 60)}:{(lunchCountdown % 60).toString().padStart(2, '0')}
                </div>
                <p>Resumes at 2:00 PM</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {ADMIN_STATUSES.map(status => (
                <button
                  key={status.value}
                  onClick={() => onStatusChange(status.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: adminStatus === status.value ? status.color : '#2a2a2a',
                    color: adminStatus === status.value ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !isLunchBreak || status.value === 'break' ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  disabled={isLunchBreak && status.value !== 'break'}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button 
                className="btn btn-primary" 
                onClick={onCallNext}
                disabled={isLunchBreak || adminStatus === 'break'}
                style={{ flex: 1, fontSize: '18px', padding: '15px' }}
              >
                ⏩ NEXT TOKEN
              </button>
              <button 
                className="btn btn-success" 
                onClick={onCompleteService}
                disabled={!currentServing}
                style={{ flex: 1 }}
              >
                ✓ Complete Service
              </button>
            </div>

            {/* Service Time Slider */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                Avg Service Time: {avgServiceTime} min
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={avgServiceTime}
                onChange={(e) => onAvgServiceTimeChange(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#f5a623',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Queue Display */}
          <div className="card" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>📋 Live Queue ({queue.length})</h3>
            {queue.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d' }}>Queue is empty</p>
            ) : (
              queue.map((visitor, idx) => {
                const position = idx + 1;
                const badge = getStatusBadge(position, visitor.token);
                return (
                  <div key={visitor.id} style={{
                    padding: '15px',
                    borderBottom: '1px solid #2a2a2a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div className="token-number" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        {visitor.token}
                      </div>
                      <div style={{ fontSize: '12px', color: '#b0b0b0' }}>
                        {visitor.name} • {visitor.purpose}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        background: badge.color,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#000',
                        marginBottom: '5px'
                      }}>
                        {badge.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6c757d' }}>
                        Wait: {formatWaitTime(visitor.estimatedWait)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowQR(!showQR)}
              className="btn"
              style={{
                width: '100%',
                background: showQR ? '#2a2a2a' : '#f5a623',
                marginBottom: '20px'
              }}
            >
              {showQR ? 'Hide QR Code' : '📱 Show QR Code'}
            </button>
            {showQR && <QRCodeScanner counterName={counterName} />}
          </div>
          
          <ActivityLog logs={activityLog} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;