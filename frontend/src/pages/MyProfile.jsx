import React, { useState } from 'react';
import { Camera, Save, X } from 'lucide-react';
import '../styles/MyProfile.css';

export default function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
    phone: storedUser.phone || '',
    bio: storedUser.bio || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = { ...storedUser, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  return (
    <div className="my-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-edit">
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email (Read-only)</label>
              <input type="email" value={formData.email} disabled />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                rows="4"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save"><Save size={18} /> Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel"><X size={18} /> Cancel</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-row">
              <label>Name</label>
              <p>{formData.name || 'Not set'}</p>
            </div>
            <div className="info-row">
              <label>Email</label>
              <p>{formData.email}</p>
            </div>
            <div className="info-row">
              <label>Phone</label>
              <p>{formData.phone || 'Not set'}</p>
            </div>
            <div className="info-row">
              <label>Bio</label>
              <p>{formData.bio || 'Not set'}</p>
            </div>
            <div className="info-row">
              <label>Role</label>
              <p className={`role-badge role-${storedUser.role?.toLowerCase()}`}>{storedUser.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
