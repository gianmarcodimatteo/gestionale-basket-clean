import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, Clock, MapPin, Users, ChevronLeft, ChevronRight, Grid3x3, List, Download } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/calendarService.js';
import { downloadICS } from '../utils/icsExport.js';
import '../styles/Calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format: (date, fmt, locale) => format(date, fmt, { locale: enUS }),
  parse: (str, fmt, locale) => parse(str, fmt, new Date(), { locale: enUS }),
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // Monday = 1
  getDay: (date) => getDay(date),
  locales,
});

const EVENT_TYPES = {
  PARTITA: { label: 'Game', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  ALLENAMENTO: { label: 'Practice', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  RIUNIONE: { label: 'Meeting', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  TRATTAMENTO: { label: 'Treatment', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' },
  EVENTO_EXTRA: { label: 'Event', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
};

const EventComponent = ({ event }) => {
  const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.ALLENAMENTO;
  const time = format(event.start, 'HH:mm');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#f1f5f9', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: typeInfo.color, flexShrink: 0 }}></span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</span>
      <span style={{ color: '#cbd5e1', flexShrink: 0 }}>{time}</span>
    </div>
  );
};

const DAILY_REPORT_SECTIONS = [
  { id: 'coaching', label: '👨‍🏫 Coaching Staff', color: '#00D9FF' },
  { id: 'strength', label: '💪 Strength & Conditioning', color: '#7FFF00' },
  { id: 'medical', label: '⚕️ Medical Staff', color: '#FF6B35' },
];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dailyReport, setDailyReport] = useState({
    coaching: { pre: '', post: '' },
    strength: { pre: '', post: '' },
    medical: { pre: '', post: '' },
  });
  const [editingSection, setEditingSection] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editText, setEditText] = useState('');
  const [dailyReportAuthenticated, setDailyReportAuthenticated] = useState(false);
  const [dailyReportPassword, setDailyReportPassword] = useState('');
  const [dailyReportError, setDailyReportError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'ALLENAMENTO',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
    location: '',
    description: '',
    notes: '',
    opponent: '',
    participants: [],
    isRecurring: false,
    reminder: 'none',
  });

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const canEdit = ['ADMIN', 'EDITOR'].includes(userRole);

  // Get next 7 days with events
  const getUpcomingDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.start);
        return eventDate.toDateString() === date.toDateString();
      });
      days.push({ date, events: dayEvents });
    }
    return days;
  };

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  useEffect(() => {
    if (viewMode === 'daily-report' && dailyReportAuthenticated) {
      loadDailyReport();
    }
  }, [currentDate, viewMode, dailyReportAuthenticated]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const result = await getEvents(start, end);
      const formattedEvents = result.data.map(e => ({
        ...e,
        start: new Date(e.startTime),
        end: e.endTime ? new Date(e.endTime) : new Date(e.startTime),
      }));
      console.log('📅 Loaded events:', formattedEvents.map(e => ({
        title: e.title,
        startTime: e.startTime,
        start: e.start,
        startFormatted: e.start.toISOString(),
      })));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyReport = async () => {
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/daily-reports?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const { data } = await response.json();
        setDailyReport(data || {
          coaching: { pre: '', post: '' },
          strength: { pre: '', post: '' },
          medical: { pre: '', post: '' },
        });
      } else {
        setDailyReport({
          coaching: { pre: '', post: '' },
          strength: { pre: '', post: '' },
          medical: { pre: '', post: '' },
        });
      }
    } catch (error) {
      console.error('Error loading daily report:', error);
    }
  };

  const getFilteredEvents = () => {
    if (!events || events.length === 0) return events;

    switch (viewMode) {
      case 'day': {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        return events.filter(e => {
          const eventDate = new Date(e.start);
          return eventDate >= dayStart && eventDate < dayEnd;
        });
      }
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return events.filter(e => {
          const eventDate = new Date(e.start);
          return eventDate >= weekStart && eventDate <= weekEnd;
        });
      }
      case 'month': {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return events.filter(e => {
          const eventDate = new Date(e.start);
          return eventDate >= monthStart && eventDate <= monthEnd;
        });
      }
      case 'agenda':
      default:
        return events;
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (!canEdit) return;
    setSelectedEvent(null);
    setFormData({
      ...formData,
      startTime: slotInfo.start,
      endTime: new Date(slotInfo.start.getTime() + 60 * 60 * 1000),
    });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      ...event,
      startTime: event.start,
      endTime: event.end,
    });
    if (canEdit) setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        createdBy: JSON.parse(localStorage.getItem('user') || '{}').id,
      };

      if (selectedEvent) {
        await updateEvent(selectedEvent.id, payload);
      } else {
        await createEvent(payload);
      }

      // Auto-create Scouting report for Game opponent
      if (formData.type === 'PARTITA' && formData.opponent) {
        try {
          const scoutingPayload = {
            opponent: formData.opponent,
            matchDate: formData.startTime.toISOString(),
            eventId: selectedEvent?.id,
          };

          const response = await fetch('/api/scouting', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(scoutingPayload),
          });

          if (!response.ok) {
            console.error('Failed to create scouting report');
          }
        } catch (error) {
          console.error('Error creating scouting report:', error);
        }
      }

      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !window.confirm('Are you sure?')) return;
    try {
      await deleteEvent(selectedEvent.id);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      type: 'ALLENAMENTO',
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      location: '',
      description: '',
      notes: '',
      participants: [],
      isRecurring: false,
    });
  };

  const eventStyleGetter = (event) => {
    const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.ALLENAMENTO;
    return {
      style: {
        backgroundColor: typeInfo.bg,
        borderLeft: `4px solid ${typeInfo.color}`,
        borderRadius: '4px',
        color: '#f1f5f9',
        border: '1px solid rgba(0, 217, 255, 0.2)',
      },
    };
  };

  return (
    <div className="page-container">
      <div className="calendar-header">
        <h1>📅 Calendar</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => downloadICS(events, 'geas-basket-calendar.ics')}
            style={{ background: 'rgba(127, 255, 0, 0.2)', color: '#7FFF00', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer', border: '1px solid rgba(127, 255, 0, 0.3)' }}
          >
            <Download size={20} /> Export .ics
          </button>
          {canEdit && (
            <button
              className="btn-add-event"
              onClick={() => {
                setSelectedEvent(null);
                setFormData({
                  ...formData,
                  startTime: new Date(),
                  endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
                });
                setIsModalOpen(true);
              }}
            >
              <Plus size={20} /> New Event
            </button>
          )}
        </div>
      </div>

      <div className="calendar-controls">
        <button className={`view-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
        <button className={`view-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
        <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
        <button className={`view-btn agenda-btn ${viewMode === 'agenda' ? 'active' : ''}`} onClick={() => setViewMode('agenda')}>Agenda</button>
        <button className={`view-btn ${viewMode === 'daily-report' ? 'active' : ''}`} onClick={() => setViewMode('daily-report')}>📋 Daily Report</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading...</div>
      ) : viewMode === 'daily-report' ? (
        <div className="calendar-container">
          {!dailyReportAuthenticated ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95), rgba(45, 53, 97, 0.85))', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '0.75rem', padding: '3rem', maxWidth: '400px', width: '90%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}>
                <h2 style={{ textAlign: 'center', color: '#f1f5f9', marginTop: 0, marginBottom: '2rem' }}>🔐 Daily Report</h2>
                {dailyReportError && <div style={{ background: 'rgba(255, 107, 53, 0.2)', border: '1px solid rgba(255, 107, 53, 0.3)', color: '#FF6B35', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>{dailyReportError}</div>}
                <input
                  type="password"
                  placeholder="Enter password"
                  value={dailyReportPassword}
                  onChange={(e) => { setDailyReportPassword(e.target.value); setDailyReportError(''); }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (dailyReportPassword === 'DailyGeas') {
                        setDailyReportAuthenticated(true);
                        setDailyReportError('');
                      } else {
                        setDailyReportError('❌ Wrong password');
                        setDailyReportPassword('');
                      }
                    }
                  }}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.2)', color: '#f1f5f9', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'inherit' }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (dailyReportPassword === 'DailyGeas') {
                      setDailyReportAuthenticated(true);
                      setDailyReportError('');
                    } else {
                      setDailyReportError('❌ Wrong password');
                      setDailyReportPassword('');
                    }
                  }}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #7FFF00, #90EE90)', color: '#000', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                >
                  🔓 Access
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '3rem' }}>
                <button onClick={() => setCurrentDate(new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000))} style={{ background: 'rgba(0, 217, 255, 0.2)', color: '#00D9FF', padding: '0.5rem 1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
                <h3 style={{ color: '#f1f5f9', margin: 0 }}>
                  {format(currentDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <button onClick={() => { setCurrentDate(new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000)); }} style={{ background: 'rgba(0, 217, 255, 0.2)', color: '#00D9FF', padding: '0.5rem 1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>Next →</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {DAILY_REPORT_SECTIONS.map(section => (
              <div key={section.id} style={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8), rgba(45, 53, 97, 0.6))', border: `1px solid ${section.color}33`, borderLeft: `4px solid ${section.color}`, borderRadius: '0.75rem', padding: '2rem' }}>
                <h2 style={{ color: section.color, marginTop: 0, marginBottom: '1.5rem' }}>{section.label}</h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setEditingSection(section.id); setEditingType('pre'); setEditText(dailyReport[section.id].pre || ''); }}
                    style={{ flex: '1 1 auto', minWidth: '150px', background: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', padding: '1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 200ms' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'}
                  >
                    Edit PRE
                  </button>
                  <button
                    onClick={() => { setEditingSection(section.id); setEditingType('post'); setEditText(dailyReport[section.id].post || ''); }}
                    style={{ flex: '1 1 auto', minWidth: '150px', background: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', padding: '1rem', border: '1px solid rgba(255, 107, 53, 0.3)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 200ms' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)'}
                  >
                    Edit POST
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.15)', borderRadius: '0.5rem', padding: '1rem', minHeight: '100px', color: '#cbd5e1', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
                    {dailyReport[section.id].pre || '—'}
                  </div>
                  <div style={{ background: 'rgba(255, 107, 53, 0.05)', border: '1px solid rgba(255, 107, 53, 0.15)', borderRadius: '0.5rem', padding: '1rem', minHeight: '100px', color: '#cbd5e1', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
                    {dailyReport[section.id].post || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingSection && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={() => setEditingSection(null)}>
              <div style={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95), rgba(45, 53, 97, 0.85))', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0, 217, 255, 0.1)', paddingBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', margin: 0 }}>
                    {DAILY_REPORT_SECTIONS.find(s => s.id === editingSection)?.label} - {editingType?.toUpperCase()}
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
                    onClick={async () => {
                      const newReport = {
                        ...dailyReport,
                        [editingSection]: {
                          ...dailyReport[editingSection],
                          [editingType]: editText,
                        },
                      };
                      setDailyReport(newReport);

                      try {
                        const dateStr = format(currentDate, 'yyyy-MM-dd');
                        const token = localStorage.getItem('token');
                        const response = await fetch('/api/daily-reports', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ date: dateStr, ...newReport }),
                        });
                        if (response.ok) {
                          alert('✓ Report saved successfully!');
                        } else {
                          alert('❌ Error saving report');
                        }
                      } catch (error) {
                        console.error('Error saving:', error);
                        alert('Error: ' + error.message);
                      }
                      setEditingSection(null);
                    }}
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
            </>
          )}
        </div>
      ) : viewMode === 'month' || viewMode === 'week' || viewMode === 'day' ? (
        <div className="calendar-container">
          <div className="events-list-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '3rem' }}>
              <button onClick={() => {
                if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
                else if (viewMode === 'week') setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
                else setCurrentDate(new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000));
              }} style={{ background: 'rgba(0, 217, 255, 0.2)', color: '#00D9FF', padding: '0.5rem 1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
              <h3 style={{ color: '#f1f5f9', margin: 0 }}>
                {viewMode === 'month'
                  ? format(currentDate, 'MMMM yyyy')
                  : viewMode === 'week'
                  ? (() => {
                      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 6);
                      return `Week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
                    })()
                  : format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button onClick={() => {
                if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
                else if (viewMode === 'week') setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
                else setCurrentDate(new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000));
              }} style={{ background: 'rgba(0, 217, 255, 0.2)', color: '#00D9FF', padding: '0.5rem 1rem', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600 }}>Next →</button>
            </div>
            {getFilteredEvents().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#cbd5e1' }}>📋 No events</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {getFilteredEvents().map(event => (
                  <div key={event.id} onClick={() => handleSelectEvent(event)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.15)', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 200ms ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)'}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: EVENT_TYPES[event.type]?.color || '#00D9FF', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{event.title}</div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                        {viewMode === 'day'
                          ? `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
                          : `${format(event.start, 'EEEE, MMM d, HH:mm')} - ${format(event.end, 'HH:mm')}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          {/* Upcoming 7 Days Sidebar */}
          <div style={{ background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8), rgba(45, 53, 97, 0.6))', border: '1px solid rgba(0, 217, 255, 0.1)', borderRadius: '0.75rem', padding: '1.5rem', minWidth: '280px', maxHeight: '75vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📅 Next 7 Days
            </h3>
            {getUpcomingDays().map((day, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: idx < 6 ? '1px solid rgba(0, 217, 255, 0.1)' : 'none' }}>
                <div style={{ color: '#00D9FF', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  {format(day.date, 'EEE, MMM d')}
                </div>
                {day.events.length === 0 ? (
                  <div style={{ color: '#7FFF00', fontSize: '0.85rem' }}>No events</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {day.events.map(event => {
                      const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.ALLENAMENTO;
                      return (
                        <div key={event.id} onClick={() => handleSelectEvent(event)} style={{ background: typeInfo.bg, border: `1px solid ${typeInfo.color}33`, borderLeft: `3px solid ${typeInfo.color}`, borderRadius: '0.35rem', padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#f1f5f9', transition: 'all 200ms' }} onMouseEnter={e => e.currentTarget.style.background = typeInfo.bg.replace('0.15', '0.25')} onMouseLeave={e => e.currentTarget.style.background = typeInfo.bg}>
                          <div style={{ fontWeight: '600', color: typeInfo.color }}>{typeInfo.label}</div>
                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{event.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{format(event.start, 'HH:mm')}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="calendar-container" style={{ flex: 1 }}>
            <Calendar
            localizer={localizer}
            events={getFilteredEvents()}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '75vh' }}
            view={viewMode}
            onView={setViewMode}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable={canEdit}
            popup
            eventPropGetter={eventStyleGetter}
            components={{ event: EventComponent }}
            step={60}
            timeslots={1}
            views={['agenda']}
            min={new Date(2000, 0, 1, 7, 0, 0)}
            messages={{
              today: 'Today',
              previous: 'Back',
              next: 'Next',
              agenda: 'Agenda',
              date: 'Date',
              time: 'Time',
              event: 'Event',
              noEventsInRange: 'No events in this range',
            }}
          />
          </div>
        </div>
      )}

      {isModalOpen && canEdit && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent ? 'Edit Event' : 'New Event'}</h2>
              <button className="modal-close" onClick={() => resetForm()}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Event title" required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              {formData.type === 'PARTITA' && (
                <div className="form-group">
                  <label>Opponent</label>
                  <input type="text" value={formData.opponent} onChange={e => setFormData({ ...formData, opponent: e.target.value })} placeholder="Enter opponent name" />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="date" value={formData.startTime.toISOString().split('T')[0]} onChange={e => {
                    const newDate = new Date(e.target.value + 'T' + formData.startTime.toISOString().split('T')[1]);
                    setFormData({ ...formData, startTime: newDate });
                  }} required />
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input type="time" value={formData.startTime.getHours().toString().padStart(2, '0') + ':' + formData.startTime.getMinutes().toString().padStart(2, '0')} onChange={e => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(formData.startTime);
                    newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                    setFormData({ ...formData, startTime: newDate });
                  }} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={formData.endTime.toISOString().split('T')[0]} onChange={e => {
                    const newDate = new Date(e.target.value + 'T' + formData.endTime.toISOString().split('T')[1]);
                    setFormData({ ...formData, endTime: newDate });
                  }} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={formData.endTime.getHours().toString().padStart(2, '0') + ':' + formData.endTime.getMinutes().toString().padStart(2, '0')} onChange={e => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(formData.endTime);
                    newDate.setHours(parseInt(hours), parseInt(minutes), 0);
                    setFormData({ ...formData, endTime: newDate });
                  }} />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Event location" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Event description..." rows={3} />
              </div>
              <div className="form-group">
                <label>Reminder</label>
                <select value={formData.reminder} onChange={e => setFormData({ ...formData, reminder: e.target.value })}>
                  <option value="none">No reminder</option>
                  <option value="1h">1 hour before</option>
                  <option value="1d">1 day before</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.isRecurring} onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })} />
                  Recurring
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">💾 {selectedEvent ? 'Update' : 'Create'}</button>
                {selectedEvent && <button type="button" className="btn-delete" onClick={handleDelete}>🗑️ Delete</button>}
                <button type="button" className="btn-cancel" onClick={() => resetForm()}>✕ Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
