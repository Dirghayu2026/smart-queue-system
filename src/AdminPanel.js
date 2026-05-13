import React, { useState } from 'react';
import { ADMIN_STATUSES } from './constants'; 
import { formatWaitTime } from './helpers';
import Activitylog from './Activitylog'; 
import QRcodeScanner from './QRcodeScanner'; 

const AdminPanel = ({ 
  queue = [], 
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

  // 📞 UPDATED TRIGGER VOICE CALL FUNCTION
  const triggerVoiceCall = async (visitor) => {
    // Firebase madhe phone kiva phoneNumber asu shakto, mhanun donhi check kara
    const number = visitor?.phone || visitor?.phoneNumber;
    const name = visitor?.name || "Guest";

    if (!number) {
      console.error("Number sapdla nahi:", visitor);
      return;
    }

    try {
      console.log("Calling via React:", name, number);
      
      const response = await fetch('http://localhost:5000/make-call', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: number, // Backend la 'phone' naavanech data pahije
          name: name 
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("Call Successful, SID:", data.sid);
      } else {
        console.error("Twilio Error from Backend:", data.error);
      }
    } catch (error) {
      console.error("Voice call server connection error:", error);
    }
  };

  const getStatusBadge = (position, token) => {
    if (token === currentServing) return { label: 'SERVING', color: '#00ff88' };
    if (position === 1) return { label: 'NEXT', color: '#ff6b35' };
    if (position <= 3) return { label: 'SOON', color: '#f5a623' };
    return { label: 'WAITING', color: '#6c757d' };
  };

  return (
    <div className="container">
      <div className="grid-2cols">
        <div>
          {/* --- ADMIN CONTROLS --- */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2>👨‍💼 Admin Control</h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (queue && queue.length > 0) {
                    const nextVisitor = queue[0];
                    // Pahile calling trigger kara
                    triggerVoiceCall(nextVisitor);
                    // Mag queue madhun delete/next kara
                    onCallNext();
                  } else {
                    alert("Queue is empty!");
                  }
                }}
                style={{ flex: 1, fontSize: '18px', padding: '15px' }}
              >
                ⏩ NEXT TOKEN & CALL
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-success" onClick={onCompleteService} style={{ flex: 1 }}>
                    ✅ COMPLETE
                </button>
                <button className={`btn ${adminStatus === 'BUSY' ? 'btn-danger' : 'btn-secondary'}`} 
                        onClick={() => onStatusChange(adminStatus === 'BUSY' ? 'AVAILABLE' : 'BUSY')}>
                    {adminStatus === 'BUSY' ? '⏸ BUSY' : '🟢 AVAILABLE'}
                </button>
            </div>
          </div>

          {/* --- LIVE QUEUE --- */}
          <div className="card">
            <h3>📋 Live Queue ({queue ? queue.length : 0})</h3>
            <div className="queue-list-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {!queue || queue.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>Queue is empty</p>
                ) : (
                queue.map((visitor, idx) => {
                    const badge = getStatusBadge(idx + 1, visitor.token);
                    return (
                    <div key={visitor.id || idx} style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <strong style={{ fontSize: '1.2em', color: '#ff6b00' }}>{visitor.token}</strong> - {visitor.name}
                            <div style={{ fontSize: '0.8em', color: '#888' }}>{visitor.purpose}</div>
                        </div>
                        <span style={{ 
                            backgroundColor: badge.color + '22', 
                            color: badge.color,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.8em',
                            border: `1px solid ${badge.color}`
                        }}>
                            {badge.label}
                        </span>
                    </div>
                    );
                })
                )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: QR & LOGS --- */}
        <div>
          <button onClick={() => setShowQR(!showQR)} className="btn btn-secondary" style={{ width: '100%', marginBottom: '15px' }}>
            {showQR ? '❌ Hide QR Code' : '📱 Show QR Code'}
          </button>
          
          {showQR && (
            <div className="card" style={{ marginBottom: '15px', textAlign: 'center' }}>
                <QRcodeScanner counterName={counterName} />
            </div>
          )}

          <Activitylog logs={activityLog || []} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;