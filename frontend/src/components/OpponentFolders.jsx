import React, { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import '../styles/OpponentFolders.css';

const formatMatchDate = (report) => {
  const iso = report.matchDate || report.date;
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

function OpponentLogo({ report, size }) {
  if (report.opponentLogo) {
    return <img src={report.opponentLogo} alt={report.opponent} className={`opponent-logo opponent-logo-${size}`} />;
  }
  return <span className={`opponent-logo opponent-logo-${size} opponent-logo-placeholder`}>{report.opponent?.charAt(0)}</span>;
}

export default function OpponentFolders({ reports, selectedReportId, onSelect }) {
  const [viewMode, setViewMode] = useState('folders');

  if (reports.length === 0) {
    return (
      <div className="opponent-folders-empty">
        Create a Game event in Calendar to add scouting folders
      </div>
    );
  }

  return (
    <div className="opponent-folders">
      <div className="opponent-folders-toolbar">
        <button
          type="button"
          className={viewMode === 'folders' ? 'active' : ''}
          onClick={() => setViewMode('folders')}
        >
          <LayoutGrid size={16} /> Folders
        </button>
        <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
          <List size={16} /> List
        </button>
      </div>

      {viewMode === 'folders' ? (
        <div className="opponent-folder-grid">
          {reports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => onSelect(report.id)}
              className={`opponent-folder ${selectedReportId === report.id ? 'active' : ''}`}
            >
              <OpponentLogo report={report} size="lg" />
              <span className="opponent-folder-name">{report.opponent}</span>
              <span className="opponent-folder-meta">{formatMatchDate(report)}</span>
              <span className="opponent-folder-meta">{report.files?.length || 0} files</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="opponent-list">
          <div className="opponent-list-row opponent-list-head">
            <span>Opponent</span>
            <span>Date</span>
            <span>Files</span>
          </div>
          {reports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => onSelect(report.id)}
              className={`opponent-list-row ${selectedReportId === report.id ? 'active' : ''}`}
            >
              <span className="opponent-list-opponent">
                <OpponentLogo report={report} size="sm" />
                {report.opponent}
              </span>
              <span>{formatMatchDate(report)}</span>
              <span>{report.files?.length || 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
