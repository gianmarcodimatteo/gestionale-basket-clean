import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit, Download, Video, FileText } from 'lucide-react';
import { getPlaybooks, createPlaybook, updatePlaybook, deletePlaybook } from '../services/playbookService.js';
import { getAuthenticatedFileUrl } from '../utils/fileUrl.js';
import '../styles/Playbook.css';

export default function PlaybookPage() {
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Offensive');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfSrc, setPdfSrc] = useState('');
  const [videoViewerOpen, setVideoViewerOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    side: 'Offensive',
    notes: '',
    file: null,
    folder: 'PDF',
  });

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const canEdit = ['ADMIN', 'EDITOR'].includes(userRole);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const playbooksRes = await getPlaybooks();
      setPlaybooks(playbooksRes.data || []);
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

      const payload = {
        ...formData,
        fileType: formData.folder
      };

      if (selectedPlaybook) {
        await updatePlaybook(selectedPlaybook.id, payload, (progress) => {
          setUploadProgress(progress);
        });
      } else {
        await createPlaybook(payload, (progress) => {
          setUploadProgress(progress);
        });
      }
      resetForm();
      setIsUploading(false);
      setUploadProgress(0);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving playbook');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this playbook?')) return;
    try {
      await deletePlaybook(id);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewPdf = async (fileUrl) => {
    try {
      const token = localStorage.getItem('token');
      const urlParts = fileUrl.split('/');
      const folder = urlParts[urlParts.length - 2];
      const filename = urlParts[urlParts.length - 1];
      const apiUrl = `/api/files/${folder}/${filename}`;

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load PDF');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPdfSrc(blobUrl);
      setPdfViewerOpen(true);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const handleViewVideo = async (fileUrl) => {
    try {
      const token = localStorage.getItem('token');
      const urlParts = fileUrl.split('/');
      const folder = urlParts[urlParts.length - 2];
      const filename = urlParts[urlParts.length - 1];
      const apiUrl = `/api/files/${folder}/${filename}`;

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load video');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideoSrc(blobUrl);
      setVideoViewerOpen(true);
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };

  const handleEdit = (playbook) => {
    setSelectedPlaybook(playbook);
    setFormData({
      name: playbook.name,
      description: playbook.description || '',
      side: playbook.side,
      tags: playbook.tags ? JSON.parse(playbook.tags) : [],
      notes: playbook.notes || '',
      file: null,
      folder: playbook.fileType || 'PDF',
    });
    setIsModalOpen(true);
  };


  const resetForm = () => {
    setIsModalOpen(false);
    setSelectedPlaybook(null);
    setFormData({
      name: '',
      description: '',
      side: 'Offensive',
      notes: '',
      file: null,
    });
  };

  const filteredPlaybooks = playbooks.filter(pb => pb.side === activeTab);

  return (
    <div className="page-container">
      <div className="playbook-header">
        <h1>📖 Playbook</h1>
        {canEdit && (
          <button className="btn-add-playbook" onClick={() => { setSelectedPlaybook(null); setFormData({...formData, side: activeTab}); setIsModalOpen(true); }}>
            <Plus size={20} /> Add Play
          </button>
        )}
      </div>

      <div className="playbook-tabs">
        <button
          className={`tab-btn ${activeTab === 'Offensive' ? 'active' : ''}`}
          onClick={() => setActiveTab('Offensive')}
        >
          🔴 Offensive
        </button>
        <button
          className={`tab-btn ${activeTab === 'Defensive' ? 'active' : ''}`}
          onClick={() => setActiveTab('Defensive')}
        >
          🔵 Defensive
        </button>
      </div>


      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading...</div>
      ) : filteredPlaybooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#cbd5e1' }}>
          📋 No plays yet. {canEdit && 'Create one to get started!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {['PDF', 'Video'].map(folder => {
            const folderPlaybooks = filteredPlaybooks
              .filter(p => (p.fileType || 'PDF') === folder)
              .sort((a, b) => a.name.localeCompare(b.name));

            return (
              <div key={folder}>
                <h2 style={{
                  marginBottom: '1rem',
                  fontSize: '1.3rem',
                  color: folder === 'PDF' ? '#00D9FF' : '#7FFF00',
                  borderBottom: `2px solid ${folder === 'PDF' ? 'rgba(0, 217, 255, 0.3)' : 'rgba(127, 255, 0, 0.3)'}`,
                  paddingBottom: '0.5rem'
                }}>
                  {folder === 'PDF' ? '📄' : '🎥'} {folder}s ({folderPlaybooks.length})
                </h2>

                {folderPlaybooks.length === 0 ? (
                  <div style={{ color: '#cbd5e1', fontStyle: 'italic', padding: '1rem' }}>
                    No {folder.toLowerCase()}s in this category
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {folderPlaybooks.map(playbook => (
                      <div
                        key={playbook.id}
                        style={{
                          padding: '1rem',
                          background: 'rgba(0, 217, 255, 0.05)',
                          border: '1px solid rgba(0, 217, 255, 0.2)',
                          borderRadius: '0.35rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.25rem 0', color: '#00D9FF' }}>{playbook.name}</h4>
                          {playbook.description && (
                            <p style={{ margin: '0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                              {playbook.description}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {playbook.fileType === 'Video' && (
                            <button
                              onClick={() => handleViewVideo(playbook.fileUrl)}
                              style={{
                                background: 'none',
                                border: '1px solid rgba(0, 217, 255, 0.3)',
                                color: '#00D9FF',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <Video size={14} /> Play
                            </button>
                          )}
                          {playbook.fileType === 'PDF' && (
                            <button
                              onClick={() => handleViewPdf(playbook.fileUrl)}
                              style={{
                                background: 'none',
                                border: '1px solid rgba(0, 217, 255, 0.3)',
                                color: '#00D9FF',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <FileText size={14} /> View
                            </button>
                          )}
                          {canEdit && (
                            <>
                              <a
                                href={getAuthenticatedFileUrl(playbook.fileUrl)}
                                download
                                style={{
                                  background: 'none',
                                  border: '1px solid rgba(0, 217, 255, 0.3)',
                                  color: '#00D9FF',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                ⬇️ DL
                              </a>
                              <button
                                onClick={() => handleEdit(playbook)}
                                style={{
                                  background: 'none',
                                  border: '1px solid rgba(0, 217, 255, 0.3)',
                                  color: '#00D9FF',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(playbook.id)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #EF4444',
                                  color: '#EF4444',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && canEdit && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPlaybook ? 'Edit Play' : 'New Play'}</h2>
              <button className="modal-close" onClick={() => resetForm()}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="playbook-form">
              <div className="form-group">
                <label>Folder *</label>
                <select
                  value={formData.folder}
                  onChange={e => setFormData({ ...formData, folder: e.target.value })}
                  required
                >
                  <option value="PDF">📄 PDF</option>
                  <option value="Video">🎥 Video</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Play title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Play description..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>📹/📄 File Upload</label>
                <div className="file-upload" onClick={() => document.querySelector('input[type="file"]')?.click()}>
                  <input
                    type="file"
                    accept="application/pdf,video/*"
                    onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                    className="file-input"
                  />
                  <span className="upload-hint">
                    {formData.file ? formData.file.name : 'PDF or Video file'}
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
                <button type="submit" className="btn-save" disabled={isUploading}>💾 {selectedPlaybook ? 'Update' : 'Create'}</button>
                <button type="button" className="btn-cancel" onClick={() => resetForm()} disabled={isUploading}>✕ Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {videoViewerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => setVideoViewerOpen(false)}>
          <div style={{
            background: '#1a1f3a',
            borderRadius: '0.75rem',
            width: '90%',
            height: '90%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
            }}>
              <h3 style={{ margin: 0, color: '#00D9FF' }}>📹 Video Player</h3>
              <button onClick={() => setVideoViewerOpen(false)} style={{
                background: 'none',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}>✕</button>
            </div>
            <video
              src={videoSrc}
              controls
              style={{
                flex: 1,
                width: '100%',
                background: '#000',
              }}
            />
          </div>
        </div>
      )}

      {pdfViewerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => setPdfViewerOpen(false)}>
          <div style={{
            background: '#1a1f3a',
            borderRadius: '0.75rem',
            width: '90%',
            height: '90%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
            }}>
              <h3 style={{ margin: 0, color: '#00D9FF' }}>📄 PDF Viewer</h3>
              <button onClick={() => setPdfViewerOpen(false)} style={{
                background: 'none',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}>✕</button>
            </div>
            <iframe
              src={pdfSrc}
              style={{
                flex: 1,
                border: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
