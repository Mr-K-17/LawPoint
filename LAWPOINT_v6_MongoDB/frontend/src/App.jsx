import { useState, useEffect } from 'react';
import api from './api/client';
import './styles/index.css';

export default function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await api.get('/health');
        setStatus('✅ ' + res.data.status);
      } catch (error) {
        setStatus('⚠️ Backend not connected. Make sure MongoDB and backend server are running.');
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">⚖️</div>
          <span>LAW POINT v6</span>
        </div>
      </header>
      <main className="landing-page">
        <h1>⚖️ LAW POINT</h1>
        <p>Your Complete Legal Solution Platform</p>

        <div className="status-message">{status}</div>

        <p style={{ fontSize: '14px', marginTop: '20px', color: '#6b7280' }}>
          Complete application coming soon with all features...
        </p>
      </main>
    </div>
  );
}
