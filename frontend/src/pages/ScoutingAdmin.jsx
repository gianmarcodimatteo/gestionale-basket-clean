import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit, Download, MessageSquare, FileText, Video } from 'lucide-react';
import { getScoutingReports, createScoutingReport, updateScoutingReport, deleteScoutingReport } from '../services/scoutingService.js';
import { getEvents } from '../services/calendarService.js';
import '../styles/Scouting.css';

export default function ScoutingAdminPage() {
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchOpponent, setSearchOpponent] = useState('');
  const [formData, setFormData] = useState({
    opponent: '',
    matchDate: '',
    eventId: '',
    content: '',
    strategy: '',
    notes: '',
    keyPlayers: [],
    file: null,
  });
  const [keyPlayerInput, setKeyPlayerInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const canEdit = ['ADMIN', 'EDITOR'].includes(userRole);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, eventsRes] = await Promise.all([
        getScoutingReports(searchOpponent ? { opponent: searchOpponent } : {}),
        getEvents(),
      ]);
      setReports(reportsRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      setUploadProgress(0);

      if (selectedReport) {
        await updateScoutingReport(selectedReport.id, formData, (progress) => {
          setUploadProgress(progress);
        });
      } else {
        await createScoutingReport(formData, (progress) => {
          setUploadProgress(progress);
        });
      }
      resetForm();
      setIsModalOpen(false);
      setIsUploading(false);
      setUploadProgress(0);
      loadData();
    } catch (error) {
      console.error('Error saving report:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this scouting report?')) {
      try {
        await deleteScoutingReport(id);
        loadData();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setFormData({
      opponent: report.opponent,
      matchDate: report.matchDate ? report.matchDate.split('T')[0] : '',
      eventId: report.eventId || '',
      content: report.content || '',
      strategy: report.strategy || '',
      notes: report.notes || '',
      keyPlayers: report.keyPlayers ? JSON.parse(report.keyPlayers) : [],
      file: null,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedReport(null);
    setFormData({
      opponent: '',
      matchDate: '',
      eventId: '',
      content: '',
      strategy: '',
      notes: '',
      keyPlayers: [],
      file: null,
    });
    setKeyPlayerInput('');
  };

  const addKeyPlayer = () => {
    if (keyPlayerInput.trim()) {
      setFormData({
        ...formData,
        keyPlayers: [...formData.keyPlayers, keyPlayerInput.trim()],
      });
      setKeyPlayerInput('');
    }
  };

  const removeKeyPlayer = (index) => {
    setFormData({
      ...formData,
      keyPlayers: formData.keyPlayers.filter((_, i) => i !== index),
    });
  };

  const getEventDisplay = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? `${event.title} - ${new Date(event.startTime).toLocaleDateString()}` : 'No event linked';
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText size={20} />;
    if (fileType === 'xlsx' || fileType === 'xls') return <FileText size={20} />;
    if (fileType === 'key') return <FileText size={20} />;
    if (fileType.includes('video') || ['mp4', 'mpeg', 'mov', 'avi', 'webm'].includes(fileType)) {
      return <Video size={20} />;
    }
    return <FileText size={20} />;
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="scouting-header">
        <h1>Scouting Management</h1>
        {canEdit && (
          <button className="btn-add-scouting" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} /> Add Scouting Report
          </button>
        )}
      </div>

      <div className="scouting-search">
        <input
          type="text"
          placeholder="Search opponent..."
          value={searchOpponent}
          onChange={(e) => setSearchOpponent(e.target.value)}
          onKeyUp={() => loadData()}
          className="search-input"
        />
      </div>

      <div className="scouting-list">
        {reports.length === 0 ? (
          <p className="no-data">No scouting reports yet</p>
        ) : (
          reports.map(report => (
            <div key={report.id} className="scouting-card">
              <div className="scouting-card-header">
                <div className="opponent-info">
                  <h3>{report.opponent}</h3>
                  <span className="event-link">{getEventDisplay(report.eventId)}</span>
                </div>
                {canEdit && (
                  <div className="card-actions">
                    <button className="action-btn" onClick={() => handleEdit(report)}>
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(report.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="scouting-dates">
                <span className="date-badge">Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                {report.matchDate && (
                  <span className="date-badge">Match: {new Date(report.matchDate).toLocaleDateString()}</span>
                )}
              </div>

              {report.keyPlayers && JSON.parse(report.keyPlayers).length > 0 && (
                <div className="key-players">
                  <strong>Key Players:</strong>
                  <div className="player-badges">
                    {JSON.parse(report.keyPlayers).map((player, idx) => (
                      <span key={idx} className="player-badge">{player}</span>
                    ))}
                  </div>
                </div>
              )}

              {report.strategy && (
                <div className="strategy-section">
                  <strong>Strategy:</strong>
                  <p>{report.strategy}</p>
                </div>
              )}

              {report.fileUrl && canEdit && (
                <div className="file-section">
                  <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                    {getFileIcon(report.fileType)}
                    <span>View {report.fileType?.toUpperCase() || 'File'}</span>
                  </a>
                </div>
              )}

              {report.notes && (
                <div className="notes-section">
                  <strong>Notes:</strong>
                  <p>{report.notes}</p>
                </div>
              )}

              <div className="created-by">
                By {report.creator?.name || 'Unknown'} on {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedReport ? 'Edit Scouting Report' : 'New Scouting Report'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form className="scouting-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Opponent *</label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Link to Game Event</label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                >
                  <option value="">Select event...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.startTime).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Match Date</label>
                <input
                  type="date"
                  value={formData.matchDate}
                  onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Key Players to Watch</label>
                <div className="key-player-input">
                  <input
                    type="text"
                    placeholder="Player name..."
                    value={keyPlayerInput}
                    onChange={(e) => setKeyPlayerInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPlayer())}
                  />
                  <button type="button" className="btn-add-player" onClick={addKeyPlayer}>
                    Add
                  </button>
                </div>
                {formData.keyPlayers.length > 0 && (
                  <div className="key-players-list">
                    {formData.keyPlayers.map((player, idx) => (
                      <div key={idx} className="key-player-item">
                        <span>{player}</span>
                        <button type="button" onClick={() => removeKeyPlayer(idx)} className="btn-remove">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Strategy Notes</label>
                <textarea
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  placeholder="Describe the opponent's strategy..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Content/Analysis</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Additional analysis..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Upload File (Excel, Keynote, PDF, Video)</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="file-input"
                    accept=".xlsx,.xls,.key,.pdf,.mp4,.webm,.mov,.avi"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="file-input"
                  />
                  <label htmlFor="file-input" className="upload-label">
                    <span>{formData.file ? formData.file.name : 'Choose file...'}</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>General Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows="2"
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
                <button type="submit" className="btn-save" disabled={isUploading}>Save Report</button>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={isUploading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
