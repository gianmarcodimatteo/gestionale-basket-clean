import React, { useState, useEffect } from 'react';
import { Plus, X, Play, Trash2, Edit, Upload, MessageSquare, Scissors, Bookmark } from 'lucide-react';
import { getTrainingSessions, createTrainingSession, updateTrainingSession, deleteTrainingSession } from '../services/practicesService.js';
import { getAuthenticatedFileUrl } from '../utils/fileUrl.js';
import '../styles/Practices.css';

export default function Practices() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [clips, setClips] = useState([]);
  const [isCreatingClip, setIsCreatingClip] = useState(false);
  const [clipData, setClipData] = useState({ title: '', startTime: 0, endTime: 0 });
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    type: 'General',
    description: '',
    notes: '',
    video: null,
  });

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const canEdit = ['ADMIN', 'EDITOR'].includes(userRole);

  useEffect(() => {
    loadSessions();
  }, [filterStartDate, filterEndDate]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      const token = localStorage.getItem('token');
      const url = `/api/practices?${params.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      setSessions(result.data || []);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      if (selectedSession) {
        await updateTrainingSession(selectedSession.id, payload, (progress) => {
          setUploadProgress(progress);
        });
      } else {
        await createTrainingSession(payload, (progress) => {
          setUploadProgress(progress);
        });
      }

      resetForm();
      setIsUploading(false);
      setUploadProgress(0);
      loadSessions();
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving training session');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!selectedSession || !window.confirm('Delete this training?')) return;
    try {
      await deleteTrainingSession(selectedSession.id);
      resetForm();
      loadSessions();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (session) => {
    setSelectedSession(session);
    setFormData({
      title: session.title,
      date: new Date(session.date).toISOString().split('T')[0],
      duration: session.duration,
      type: session.type,
      description: session.description || '',
      notes: session.notes || '',
      video: null,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      type: 'General',
      description: '',
      notes: '',
      video: null,
    });
  };

  const loadFeedback = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/training-feedback/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setFeedback(result.data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const addFeedback = async () => {
    if (!feedbackInput || !selectedSession) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/training-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainingId: selectedSession.id,
          content: feedbackInput,
          type: 'feedback',
        }),
      });
      setFeedbackInput('');
      loadFeedback(selectedSession.id);
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  const loadClips = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/training-clips/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setClips(result.data || []);
    } catch (error) {
      console.error('Error loading clips:', error);
    }
  };

  const createClip = async (videoElement) => {
    if (!selectedSession || !clipData.title) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/training-clips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainingId: selectedSession.id,
          title: clipData.title,
          startTime: Math.round(clipData.startTime),
          endTime: Math.round(clipData.endTime),
        }),
      });
      setIsCreatingClip(false);
      setClipData({ title: '', startTime: 0, endTime: 0 });
      loadClips(selectedSession.id);
    } catch (error) {
      console.error('Error creating clip:', error);
    }
  };

  const loadVideoWithAuth = async (fileUrl) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getAuthenticatedFileUrl(fileUrl);

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load video');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideoSrc(blobUrl);
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };

  const handleVideoPlay = (session) => {
    setSelectedSession(session);
    setVideoPlayerOpen(true);
    setVideoSrc('');
    loadVideoWithAuth(session.fileUrl);
    loadFeedback(session.id);
    loadClips(session.id);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page-container">
      <div className="trainings-header">
        <div>
          <h1>🏋️ Practices</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              placeholder="Start Date"
              style={{ padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1' }}
            />
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              placeholder="End Date"
              style={{ padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1' }}
            />
            {(filterStartDate || filterEndDate) && (
              <button
                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                style={{ padding: '0.5rem 1rem', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '0.35rem', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        {canEdit && (
          <button className="btn-add-training" onClick={() => { setSelectedSession(null); setIsModalOpen(true); }}>
            <Plus size={20} /> New Practice
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#cbd5e1' }}>
          📹 No trainings yet. {canEdit && 'Create one to get started!'}
        </div>
      ) : (
        <div className="trainings-grid">
          {sessions.map(session => (
            <div key={session.id} className="training-card">
              <div className="training-header">
                <h3>{session.title}</h3>
                {canEdit && (
                  <div className="training-actions">
                    <button onClick={() => handleEdit(session)} className="action-btn edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => { setSelectedSession(session); handleDelete(); }} className="action-btn delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="training-info">
                <div className="info-item">
                  <span className="label">📅 Date</span>
                  <span className="value">{formatDate(session.date)}</span>
                </div>
                <div className="info-item">
                  <span className="label">⏱️ Duration</span>
                  <span className="value">{session.duration} min</span>
                </div>
                <div className="info-item">
                  <span className="label">🏷️ Type</span>
                  <span className="value">{session.type}</span>
                </div>
              </div>

              {session.description && (
                <div className="training-description">
                  <p>{session.description}</p>
                </div>
              )}

              {session.fileUrl && (
                <div className="training-video" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => handleVideoPlay(session)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 217, 255, 0.1))',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '0.35rem',
                      color: '#00D9FF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                    }}
                  >
                    <Play size={18} /> Player
                  </button>
                  {session.videoDuration && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(127, 255, 0, 0.1)',
                      border: '1px solid rgba(127, 255, 0, 0.3)',
                      borderRadius: '0.35rem',
                      color: '#7FFF00',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}>
                      {formatTime(session.videoDuration)}
                    </div>
                  )}
                </div>
              )}

              {session.notes && (
                <div className="training-notes">
                  <small>📝 {session.notes}</small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && canEdit && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSession ? 'Edit Training' : 'New Training'}</h2>
              <button className="modal-close" onClick={() => resetForm()}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="training-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Training session title"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min="10"
                    max="300"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option>General</option>
                  <option>Offensive</option>
                  <option>Defensive</option>
                  <option>Conditioning</option>
                  <option>Tactical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Training description..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>📹 Video Upload</label>
                <div className="video-upload" onClick={() => document.querySelector('input[type="file"]')?.click()}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setFormData({ ...formData, video: e.target.files[0] })}
                    className="file-input"
                  />
                  <span className="upload-hint">
                    {formData.video ? formData.video.name : 'Choose a video file (MP4, MOV, AVI, WebM)'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              {isUploading && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Uploading... {Math.round(uploadProgress)}%
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(127, 255, 0, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid rgba(127, 255, 0, 0.3)'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, rgba(127, 255, 0, 0.8), rgba(0, 217, 255, 0.8))',
                      transition: 'width 0.2s ease'
                    }} />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={isUploading}>💾 {selectedSession ? 'Update' : 'Create'}</button>
                {selectedSession && <button type="button" className="btn-delete" onClick={handleDelete} disabled={isUploading}>🗑️ Delete</button>}
                <button type="button" className="btn-cancel" onClick={() => resetForm()} disabled={isUploading}>✕ Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {videoPlayerOpen && selectedSession && (
        <div className="modal-overlay" onClick={() => setVideoPlayerOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>📹 {selectedSession.title} - Video Player</h2>
              <button className="modal-close" onClick={() => setVideoPlayerOpen(false)}><X size={24} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Video Player */}
              <div>
                <video
                  ref={el => window.videoElement = el}
                  src={videoSrc}
                  controls
                  style={{
                    width: '100%',
                    borderRadius: '0.5rem',
                    background: '#000',
                    maxHeight: '400px',
                  }}
                />
                {selectedSession.videoDuration && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Duration: {formatTime(selectedSession.videoDuration)}
                  </div>
                )}
              </div>

              {/* Clips Section */}
              <div style={{
                background: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#00D9FF', fontSize: '1rem' }}>✂️ Video Clips</h3>
                  {canEdit && (
                    <button
                      onClick={() => setIsCreatingClip(!isCreatingClip)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#00D9FF',
                        color: '#000',
                        border: 'none',
                        borderRadius: '0.35rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                      }}
                    >
                      <Scissors size={16} /> Create Clip
                    </button>
                  )}
                </div>

                {isCreatingClip && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: '0.35rem' }}>
                    <input
                      type="text"
                      value={clipData.title}
                      onChange={e => setClipData({ ...clipData, title: e.target.value })}
                      placeholder="Clip title"
                      style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        value={clipData.startTime}
                        onChange={e => setClipData({ ...clipData, startTime: parseFloat(e.target.value) })}
                        placeholder="Start (seconds)"
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                      />
                      <input
                        type="number"
                        value={clipData.endTime}
                        onChange={e => setClipData({ ...clipData, endTime: parseFloat(e.target.value) })}
                        placeholder="End (seconds)"
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <button
                      onClick={() => createClip()}
                      style={{
                        padding: '0.5rem',
                        background: '#10B981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      Save Clip
                    </button>
                  </div>
                )}

                {clips.length === 0 ? (
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>No clips yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {clips.map(clip => (
                      <div key={clip.id} style={{
                        padding: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '0.35rem',
                        cursor: 'pointer',
                      }}>
                        <div style={{ fontWeight: '600', color: '#10B981', fontSize: '0.9rem' }}>{clip.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              <div style={{
                background: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '0.5rem',
                padding: '1rem',
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#A78BFA', fontSize: '1rem' }}>💬 Feedback & Notes</h3>

                {canEdit && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      value={feedbackInput}
                      onChange={e => setFeedbackInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addFeedback()}
                      placeholder="Add feedback or notes..."
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.35rem',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                    <button
                      onClick={addFeedback}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#A78BFA',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.35rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      Post
                    </button>
                  </div>
                )}

                {feedback.length === 0 ? (
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>No feedback yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {feedback.map(f => (
                      <div key={f.id} style={{
                        padding: '0.75rem',
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '0.35rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#A78BFA', fontSize: '0.9rem' }}>{f.author}</div>
                            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '0.25rem' }}>{f.content}</div>
                          </div>
                          {canEdit && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem('token');
                                await fetch(`/api/training-feedback/${f.id}`, {
                                  method: 'DELETE',
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                loadFeedback(selectedSession.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '0.25rem',
                              }}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
