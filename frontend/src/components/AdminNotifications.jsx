import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import './AdminNotifications.css';

export default function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    if (selectedUsers.length === 0) {
      addToast('Please select at least one user', 'error');
      return;
    }

    setLoading(true);
    try {
      const endpoint = selectedUsers.length === 1 ? '/api/notifications/send' : '/api/notifications/broadcast';
      const payload = selectedUsers.length === 1
        ? {
            userId: selectedUsers[0],
            title,
            message,
            type,
          }
        : {
            userIds: selectedUsers,
            title,
            message,
            type,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Notification sent to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
        setTitle('');
        setMessage('');
        setSelectedUsers([]);
        setTimeout(() => setSuccessMessage(''), 3000);
        addToast('Notification sent successfully', 'success');
      } else {
        addToast('Error sending notification', 'error');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      addToast('Error sending notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  return (
    <div className="admin-notifications">
      <div className="admin-notifications-card">
        <h2>Send Notifications</h2>
        <form onSubmit={handleSendNotification} className="notification-form">
          <div className="form-group">
            <label htmlFor="title">Notification Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="INFO">Info</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          <div className="form-group">
            <label>Recipients ({selectedUsers.length} selected)</label>
            <button
              type="button"
              className="btn-select-all"
              onClick={handleSelectAll}
            >
              {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="users-list">
              {users.map(user => (
                <label key={user.id} className="user-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                  />
                  <span>{user.email}</span>
                  <span className="user-role">{user.role}</span>
                </label>
              ))}
            </div>
          </div>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <button
            type="submit"
            className="btn-send"
            disabled={loading || selectedUsers.length === 0}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
