import React from 'react';
import { getQRCodeUrl } from './helpers';

const QRcodeScanner = ({ counterName = "Accounts Counter" }) => {

  const qrUrl = getQRCodeUrl(counterName);

  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        marginTop: '20px'
      }}
    >
      <h3 style={{ color: '#f5a623', marginBottom: '15px' }}>
        📱 Scan QR Code
      </h3>

      <img
        src={qrUrl}
        alt="QR Code"
        style={{
          width: '220px',
          height: '220px',
          borderRadius: '12px',
          background: 'white',
          padding: '10px'
        }}
      />

      <p style={{ marginTop: '15px', color: '#b0b0b0' }}>
        Scan to Join Queue
      </p>
    </div>
  );
};

export default QRcodeScanner;