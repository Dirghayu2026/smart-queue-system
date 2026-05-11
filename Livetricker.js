import React, { useEffect, useState } from 'react';

const LiveTicker = ({ currentServing, queue }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const servingTokens = [currentServing, ...queue.slice(0, 4).map(v => v.token)];

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: '#0a0a0a',
      borderBottom: '2px solid #f5a623',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      padding: '12px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'inline-block',
        animation: 'scrollTicker 20s linear infinite',
        paddingLeft: '100%'
      }}>
        {servingTokens.map((token, idx) => (
          <span key={idx} style={{
            display: 'inline-block',
            marginRight: '40px',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {token ? (
              <>
                🎫 <span style={{ color: '#00ff88' }}>{token}</span> being served
              </>
            ) : (
              '⚡ Queue Active ⚡'
            )}
          </span>
        ))}
        <span style={{ marginLeft: '20px', color: '#f5a623' }}>
          📍 Accounts Section — Please take a token
        </span>
      </div>
      <style>
        {`
          @keyframes scrollTicker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
};

export default LiveTicker;