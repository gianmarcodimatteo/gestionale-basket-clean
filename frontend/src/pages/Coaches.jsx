import React, { useState } from 'react';
import ScoutingAdminSections from './ScoutingAdminSections';
import '../styles/PasswordModal.css';

export default function CoachesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'Coaches26') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('❌ Password scorretta');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="password-modal-overlay">
        <div className="password-modal">
          <h1>🔐 Accesso Coaches</h1>
          <p>Inserisci la password per accedere</p>

          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="password-input"
            />
            {error && <p className="password-error">{error}</p>}
            <button type="submit" className="password-submit-btn">
              🔓 Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <ScoutingAdminSections />;
}
