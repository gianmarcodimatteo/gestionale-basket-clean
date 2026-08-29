import React, { useState, useEffect } from 'react';
import { Trash2, Shield } from 'lucide-react';
import { useUserRole } from '../hooks/useUserRole';
import AdminNotifications from '../components/AdminNotifications';

export default function Admin() {
  const { isAdmin } = useUserRole();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error loading utenti');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'aggiornamento ruolo');
      }

      setSuccess('Ruolo aggiornato con successo');
      loadUsers();
    } catch (err) {
      setError(err.message);
      console.error('Error updating role:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'eliminazione');
      }

      setSuccess('Utente eliminato con successo');
      loadUsers();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting user:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#FF5860' }}>
          <h1>❌ Access Denied</h1>
          <p>Only admins possono accedere a questa sezione.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={32} /> Admin Panel
        </h1>
        <p style={{ color: '#cbd5e1' }}>Manage users, roles, and notifications</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'users' ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
            color: activeTab === 'users' ? '#00D9FF' : '#cbd5e1',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid #00D9FF' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'users' ? '600' : '400',
            transition: 'all 0.2s',
          }}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'notifications' ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
            color: activeTab === 'notifications' ? '#00D9FF' : '#cbd5e1',
            border: 'none',
            borderBottom: activeTab === 'notifications' ? '2px solid #00D9FF' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'notifications' ? '600' : '400',
            transition: 'all 0.2s',
          }}
        >
          Notifications
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          {error && (
            <div style={{ background: 'rgba(255, 56, 96, 0.1)', border: '1px solid #FF5860', color: '#FF5860', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(127, 255, 0, 0.1)', border: '1px solid #7FFF00', color: '#7FFF00', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#cbd5e1' }}>
          Loading users...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Nome</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Ruolo</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#cbd5e1', fontWeight: '600' }}>Data Registrazione</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#cbd5e1', fontWeight: '600' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <td style={{ padding: '1rem', color: '#e2e8f0' }}>{user.email}</td>
                  <td style={{ padding: '1rem', color: '#e2e8f0' }}>{user.name || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{
                        background: 'rgba(0, 217, 255, 0.1)',
                        color: '#00D9FF',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.35rem',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      <option value="USER">USER (Viewer)</option>
                      <option value="EDITOR">EDITOR (Edit)</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                    {new Date(user.createdAt).toLocaleDateString('it-IT')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{
                        background: 'rgba(255, 56, 96, 0.1)',
                        color: '#FF5860',
                        border: '1px solid rgba(255, 56, 96, 0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.35rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#cbd5e1' }}>
              No users found
            </div>
          )}
        </div>
      )}
        </>
      )}

      {activeTab === 'notifications' && (
        <AdminNotifications />
      )}
    </div>
  );
}
