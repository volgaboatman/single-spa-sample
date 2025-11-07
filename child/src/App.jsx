import React from 'react';
import './App.css';

function App() {
  const host = window.location.host;
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  const origin = window.location.origin;

  return (
    <div className="child-app">
      <div className="host-info">
        <h2>Host Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Host:</span>
            <span className="info-value">{host}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Protocol:</span>
            <span className="info-value">{protocol}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Hostname:</span>
            <span className="info-value">{hostname}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Port:</span>
            <span className="info-value">{port || 'default'}</span>
          </div>
          <div className="info-item full-width">
            <span className="info-label">Origin:</span>
            <span className="info-value">{origin}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

