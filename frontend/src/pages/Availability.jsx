import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import '../styles/PasswordModal.css';
import '../styles/Availability.css';

const AVAILABILITY_PASSWORD = 'Coaches2026';

const STATUS_LABELS = {
  AVAILABLE: 'Available',
  LIMITED: 'Limited',
  INJURED: 'Injured',
};

const EMPTY_FORM = {
  name: '',
  number: '',
  position: '',
  height: '',
  weight: '',
  dateOfBirth: '',
  nationality: '',
  status: 'AVAILABLE',
  notes: '',
};

const formatPercent = (value) => (value === null || value === undefined ? '—' : `${value}%`);

const formatChipDate = (iso) => {
  const d = new Date(iso);
  return String(d.getDate()).padStart(2, '0');
};

function PlayerCard({ player, canEdit, onEdit }) {
  const availabilityPercent = player.availability.percent ?? 0;
  const barColor = availabilityPercent >= 90 ? '#4ade80' : availabilityPercent >= 75 ? '#fb923c' : '#ef4444';

  return (
    <article className={`availability-card status-${player.status.toLowerCase()}`}>
      <header className="availability-card-header">
        <div className="availability-photo">
          {player.photo ? <img src={player.photo} alt={player.name} /> : <span>{player.number}</span>}
        </div>
        <div className="availability-identity">
          <h3>{player.name}</h3>
          <span className="availability-meta">
            #{player.number} · {player.position}
          </span>
          <div className="availability-bar">
            <div style={{ width: `${availabilityPercent}%`, background: barColor }} />
          </div>
          <span className="availability-bar-value">{formatPercent(player.availability.percent)}</span>
        </div>
        {canEdit && (
          <button className="availability-edit" onClick={() => onEdit(player)} aria-label="Edit player">
            <Pencil size={16} />
          </button>
        )}
      </header>

      <div className="availability-chips">
        {player.chips.length === 0 && <span className="availability-muted">No sessions yet</span>}
        {player.chips.map((chip) => (
          <span
            key={chip.date}
            className={`availability-chip ${chip.available ? 'chip-available' : 'chip-missed'}`}
            title={`${chip.type} · ${new Date(chip.date).toLocaleDateString('en-GB')}`}
          >
            {formatChipDate(chip.date)}
          </span>
        ))}
      </div>

      <dl className="availability-stats">
        <div>
          <dt>
            <i className="dot dot-green" /> Available
          </dt>
          <dd>
            {player.availability.available}/{player.availability.total}
            <span>{formatPercent(player.availability.percent)}</span>
          </dd>
        </div>
        <div>
          <dt>Practices</dt>
          <dd>
            {player.practices.attended}/{player.practices.total}
            <span>{formatPercent(player.practices.percent)}</span>
          </dd>
        </div>
        <div>
          <dt>
            <i className="dot dot-red" /> Days Missed
          </dt>
          <dd>{player.daysMissed}</dd>
        </div>
        <div>
          <dt>Consecutive days</dt>
          <dd>{player.consecutive}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className={`status-text status-${player.status.toLowerCase()}`}>{STATUS_LABELS[player.status]}</dd>
        </div>
      </dl>

      {player.notes && <p className="availability-notes">{player.notes}</p>}
    </article>
  );
}

function PlayerFormModal({ player, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!player) return;
    setForm({
      name: player.name || '',
      number: player.number ?? '',
      position: player.position || '',
      height: player.height ?? '',
      weight: player.weight ?? '',
      dateOfBirth: player.dateOfBirth ? player.dateOfBirth.slice(0, 10) : '',
      nationality: player.nationality || '',
      status: player.status || 'AVAILABLE',
      notes: player.notes || '',
    });
  }, [player]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/roster/${player.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      onSaved();
    } catch (err) {
      console.error('Error saving player:', err);
      setError('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="availability-modal-overlay" onClick={onClose}>
      <form className="availability-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="availability-modal-header">
          <h2>Edit player</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="availability-form-grid">
          <label>
            Name
            <input value={form.name} onChange={update('name')} required />
          </label>
          <label>
            Number
            <input type="number" value={form.number} onChange={update('number')} required />
          </label>
          <label>
            Position
            <input value={form.position} onChange={update('position')} required />
          </label>
          <label>
            Height (cm)
            <input type="number" step="0.1" value={form.height} onChange={update('height')} />
          </label>
          <label>
            Weight (kg)
            <input type="number" step="0.1" value={form.weight} onChange={update('weight')} />
          </label>
          <label>
            Date of birth
            <input type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
          </label>
          <label>
            Nationality
            <input value={form.nationality} onChange={update('nationality')} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={update('status')}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="availability-form-wide">
            Notes
            <textarea rows={3} value={form.notes} onChange={update('notes')} />
          </label>
        </div>

        {error && <p className="availability-error">{error}</p>}

        <div className="availability-modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AvailabilityPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [rosterPlayer, setRosterPlayer] = useState(null);

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const canEdit = ['ADMIN', 'EDITOR'].includes(userRole);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/availability/players', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      setPlayers(json.data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) loadPlayers();
  }, [authenticated]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === AVAILABILITY_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Password scorretta');
      setPassword('');
    }
  };

  const openEditor = async (player) => {
    try {
      const res = await fetch(`/api/roster/${player.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const json = await res.json();
      setRosterPlayer(json.data || player);
      setEditingPlayer(player);
    } catch (error) {
      console.error('Error loading player:', error);
    }
  };

  if (!authenticated) {
    return (
      <div className="password-modal-overlay">
        <div className="password-modal">
          <h1>🔐 Accesso Availability</h1>
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
            {passwordError && <p className="password-error">{passwordError}</p>}
            <button type="submit" className="password-submit-btn">
              🔓 Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="availability-page">
      <header className="availability-page-header">
        <h1>Availability</h1>
        <span className="availability-muted">{players.length} players</span>
      </header>

      {loading && players.length === 0 && <p className="availability-muted">Loading…</p>}

      <div className="availability-grid">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} canEdit={canEdit} onEdit={openEditor} />
        ))}
      </div>

      {editingPlayer && rosterPlayer && canEdit && (
        <PlayerFormModal
          player={rosterPlayer}
          onClose={() => {
            setEditingPlayer(null);
            setRosterPlayer(null);
          }}
          onSaved={() => {
            setEditingPlayer(null);
            setRosterPlayer(null);
            loadPlayers();
          }}
        />
      )}
    </div>
  );
}
