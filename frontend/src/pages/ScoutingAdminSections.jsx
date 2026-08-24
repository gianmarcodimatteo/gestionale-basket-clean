import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, FileText, Video } from 'lucide-react';
import { getScoutingReports, deleteScoutingReport } from '../services/scoutingService.js';
import { getAuthenticatedFileUrl } from '../utils/fileUrl.js';
import '../styles/Scouting.css';

export default function ScoutingAdminPage() {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfSrc, setPdfSrc] = useState('');
  const [videoViewerOpen, setVideoViewerOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const canEdit = ['ADMIN', 'EDITOR'].includes(userRole);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await getScoutingReports({});
      setReports(res.data || []);
      // NON selezionare il primo report automaticamente - l'utente deve cliccare
      // setSelectedReportId(res.data[0].id);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedReportId) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/scouting/' + selectedReportId, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (response.ok) {
        setFile(null);
        loadReports();
        alert('✓ File uploaded successfully!');
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading file');
    }
  };

  const handleDeleteFile = async (id) => {
    if (window.confirm('Delete this file?')) {
      try {
        const response = await fetch(`/api/scouting/${id}/file`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.ok) {
          loadReports();
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
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

  const handleDelete = async (id) => {
    if (window.confirm('Delete this report?')) {
      try {
        await deleteScoutingReport(id);
        loadReports();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleCleanupOrphans = async () => {
    if (!window.confirm('Delete all reports without associated Calendar events?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scouting/cleanup/orphans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        alert(`✓ Deleted ${result.deletedCount} orphan reports`);
        loadReports();
      } else {
        alert('❌ Cleanup failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error cleaning up orphans:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <div className="page-container">
      <div className="scouting-header">
        <h1>📁 Scouting Files</h1>
        {canEdit && (
          <button
            onClick={handleCleanupOrphans}
            style={{ background: 'rgba(255, 107, 53, 0.2)', color: '#FF6B35', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 107, 53, 0.3)', fontWeight: '600', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 53, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)'}
          >
            🗑️ Cleanup Orphans
          </button>
        )}
      </div>

      {/* Folders Grid */}
      {reports.length > 0 ? (
        <div className="folders-grid">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              className={`folder-button ${selectedReportId === report.id ? 'active' : ''}`}
              style={{
                padding: '1rem 1.5rem',
                background: selectedReportId === report.id
                  ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(0, 217, 255, 0.1))'
                  : 'rgba(26, 31, 58, 0.7)',
                border: selectedReportId === report.id
                  ? '2px solid #00D9FF'
                  : '1px solid rgba(0, 217, 255, 0.2)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                textAlign: 'center',
                display: 'inline-block',
                fontWeight: '600',
                color: selectedReportId === report.id ? '#00D9FF' : '#f1f5f9',
              }}
              onMouseEnter={(e) => {
                if (selectedReportId !== report.id) {
                  e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedReportId !== report.id) {
                  e.currentTarget.style.background = 'rgba(26, 31, 58, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.2)';
                }
              }}
            >
              {report.opponent} • {new Date(report.matchDate || report.createdAt).toLocaleDateString()}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#cbd5e1', fontSize: '1.1rem' }}>
          Create a Game event in Calendar to add scouting folders
        </div>
      )}

      {selectedReport && (
        <div style={{ marginTop: '2rem' }}>
          {/* Upload Section */}
          {canEdit && (
            <form onSubmit={handleUpload} style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-end',
                padding: '1.5rem',
                background: 'rgba(127, 255, 0, 0.05)',
                border: '2px dashed rgba(127, 255, 0, 0.3)',
                borderRadius: '0.75rem',
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Upload File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".xlsx,.xls,.key,.pdf,.mp4,.webm,.mov,.avi"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      color: '#f1f5f9',
                      borderRadius: '0.5rem',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!file}
                  style={{
                    background: file ? 'linear-gradient(135deg, #7FFF00, #90EE90)' : '#666',
                    color: '#000',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: file ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                  }}
                >
                  <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Upload
                </button>
              </div>
              {file && (
                <p style={{ color: '#7FFF00', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  ✓ {file.name}
                </p>
              )}
            </form>
          )}

          {/* Files List */}
          <div>
            <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>📂 Files</h3>
            {selectedReport.fileUrl ? (
              <div style={{
                background: 'rgba(26, 31, 58, 0.7)',
                border: '1px solid rgba(0, 217, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {selectedReport.fileType?.includes('video') || ['mp4', 'webm', 'mov', 'avi'].includes(selectedReport.fileType) ? (
                    <Video size={24} style={{ color: '#00D9FF' }} />
                  ) : (
                    <FileText size={24} style={{ color: '#00D9FF' }} />
                  )}
                  <div>
                    <p style={{ color: '#f1f5f9', margin: 0, fontWeight: '600' }}>
                      {selectedReport.fileType?.toUpperCase()}
                    </p>
                    <p style={{ color: '#cbd5e1', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                      {new Date(selectedReport.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['mp4', 'webm', 'mov', 'avi', 'video'].includes(selectedReport.fileType?.toLowerCase()) && (
                    <button
                      onClick={() => handleViewVideo(selectedReport.fileUrl)}
                      style={{
                        background: 'rgba(127, 255, 0, 0.2)',
                        color: '#7FFF00',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      <Video size={16} />
                      Watch Video
                    </button>
                  )}
                  {selectedReport.fileType?.toLowerCase() === 'pdf' && (
                    <button
                      onClick={() => handleViewPdf(selectedReport.fileUrl)}
                      style={{
                        background: 'rgba(127, 255, 0, 0.2)',
                        color: '#7FFF00',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                      }}
                    >
                      <FileText size={16} />
                      View PDF
                    </button>
                  )}
                  <a
                    href={getAuthenticatedFileUrl(selectedReport.fileUrl)}
                    download
                    style={{
                      background: 'rgba(0, 217, 255, 0.2)',
                      color: '#00D9FF',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                    }}
                  >
                    <Download size={16} />
                    Download
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteFile(selectedReport.id)}
                      style={{
                        background: 'rgba(255, 56, 96, 0.2)',
                        color: '#FF5860',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: '#cbd5e1', textAlign: 'center', padding: '2rem' }}>
                No files uploaded yet
              </p>
            )}
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
