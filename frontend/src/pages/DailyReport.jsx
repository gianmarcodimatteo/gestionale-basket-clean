import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

const SECTIONS = [
  { id: 'coaching', label: '👨‍🏫 Coaching Staff', color: '#00D9FF' },
  { id: 'strength', label: '💪 Strength & Conditioning', color: '#7FFF00' },
  { id: 'medical', label: '⚕️ Medical Staff', color: '#FF6B35' },
];

export default function DailyReport() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [report, setReport] = useState({
    coaching: { pre: '', post: '' },
    strength: { pre: '', post: '' },
    medical: { pre: '', post: '' },
  });
  const [editingSection, setEditingSection] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [currentDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/daily-reports?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const { data } = await response.json();
        setReport(data || {
          coaching: { pre: '', post: '' },
          strength: { pre: '', post: '' },
          medical: { pre: '', post: '' },
        });
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (sectionId, type) => {
    setEditingSection(sectionId);
    setEditingType(type);
    setEditText(report[sectionId][type] || '');
  };

  const handleSaveEdit = async () => {
    console.log('💾 Saving report...');
    const newReport = {
      ...report,
      [editingSection]: {
        ...report[editingSection],
        [editingType]: editText,
      },
    };
    setReport(newReport);

    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const token = localStorage.getItem('token');
      console.log('📤 Posting to /api/daily-reports:', { date: dateStr, ...newReport });
      const response = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: dateStr, ...newReport }),
      });
      console.log('✅ Response status:', response.status);
      if (response.ok) {
        alert('✓ Report saved successfully!');
      } else {
        alert('❌ Error saving report: ' + response.statusText);
      }
    } catch (error) {
      console.error('❌ Error saving report:', error);
      alert('Error: ' + error.message);
    }

    setEditingSection(null);
    setEditingType(null);
  };

  return (
    <div className="page-container">
      <div className="daily-report-header">
        <h1>📋 Daily Report</h1>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '3rem' }}>
        <button onClick={() => setCurrentDate(subDays(currentDate, 1))} style={{ background: 'rgba(0, 217, 255, 0.2)', color: '#00D9FF', padding: '0.5rem 1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h3 style={{ color: '#f1f5f9', margin: 0 }}>
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <button onClick={() => setCurrentDate(addDays(currentDate, 1))} style={{ background: 'rgba(0, 217, 255, 0.2)', color: '#00D9FF', padding: '0.5rem 1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>Next →</button>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {SECTIONS.map(section => (
          <div key={section.id} style={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8), rgba(45, 53, 97, 0.6))', border: `1px solid ${section.color}33`, borderLeft: `4px solid ${section.color}`, borderRadius: '0.75rem', padding: '2rem' }}>
            <h2 style={{ color: section.color, marginTop: 0, marginBottom: '1.5rem' }}>{section.label}</h2>

            {/* PRE/POST Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleOpenEdit(section.id, 'pre')}
                style={{ flex: '1 1 auto', minWidth: '150px', background: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', padding: '1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 200ms' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'}
              >
                <Edit2 size={18} /> PRE
              </button>
              <button
                onClick={() => handleOpenEdit(section.id, 'post')}
                style={{ flex: '1 1 auto', minWidth: '150px', background: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', padding: '1rem', border: '1px solid rgba(255, 107, 53, 0.3)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 200ms' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)'}
              >
                <Edit2 size={18} /> POST
              </button>
            </div>

            {/* Content Display */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.15)', borderRadius: '0.5rem', padding: '1rem', minHeight: '100px', color: '#cbd5e1', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
                {report[section.id].pre || '—'}
              </div>
              <div style={{ background: 'rgba(255, 107, 53, 0.05)', border: '1px solid rgba(255, 107, 53, 0.15)', borderRadius: '0.5rem', padding: '1rem', minHeight: '100px', color: '#cbd5e1', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
                {report[section.id].post || '—'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingSection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={() => setEditingSection(null)}>
          <div style={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95), rgba(45, 53, 97, 0.85))', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0, 217, 255, 0.1)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', margin: 0 }}>
                {SECTIONS.find(s => s.id === editingSection)?.label} - {editingType?.toUpperCase()}
              </h2>
              <button onClick={() => setEditingSection(null)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
                <X size={24} />
              </button>
            </div>

            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter your notes here..."
              style={{ width: '100%', minHeight: '300px', background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)', color: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical', marginBottom: '1.5rem' }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSaveEdit}
                style={{ flex: 1, background: 'linear-gradient(135deg, #7FFF00, #90EE90)', color: '#000', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
              >
                💾 Save
              </button>
              <button
                onClick={() => setEditingSection(null)}
                style={{ flex: 1, background: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', padding: '0.75rem 1.5rem', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
