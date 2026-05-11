import React from 'react';

const ActivityLog = ({ logs }) => {
  return (
    <div className="card" style={{ height: '400px', overflowY: 'auto' }}>
      <h3 style={{ 
        color: '#f5a623', 
        marginBottom: '20px',
        fontFamily: 'Bebas Neue, cursive',
        fontSize: '24px'
      }}>
        📋 Activity Log
      </h3>
      <div>
        {logs.length === 0 ? (
          <p style={{ color: '#6c757d', textAlign: 'center' }}>No activity yet</p>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{
              padding: '12px',
              borderBottom: '1px solid #2a2a2a',
              fontSize: '13px',
              transition: 'background 0.2s'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '5px'
              }}>
                <span className="mono-text" style={{ color: '#f5a623' }}>
                  {log.timestamp}
                </span>
                <span style={{ 
                  background: '#2a2a2a',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {log.action}
                </span>
              </div>
              <div style={{ color: '#b0b0b0' }}>{log.details}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;