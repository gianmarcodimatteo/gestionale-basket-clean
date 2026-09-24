import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, TrendingUp, Bell, Plus, Upload, Users } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [nextGame, setNextGame] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [daysUntilGame, setDaysUntilGame] = useState(null);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Load next game
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

      const calendarRes = await fetch(
        `/api/calendar?startDate=${today.toISOString()}&endDate=${futureDate.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (calendarRes.ok) {
        const calendarData = await calendarRes.json();
        // Fix: access .data instead of .events, filter for PARTITA type
        const gameEvents = calendarData.data?.filter(e => e.type === 'PARTITA') || [];
        if (gameEvents.length > 0) {
          const nextGameEvent = gameEvents[0];
          setNextGame(nextGameEvent);

          const gameDate = new Date(nextGameEvent.startTime);
          const diff = Math.ceil((gameDate - today) / (1000 * 60 * 60 * 24));
          setDaysUntilGame(Math.max(0, diff));
        }
      }

      // Load recent files from all sections
      const allFiles = [];

      try {
        const playbookRes = await fetch('/api/playbook', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (playbookRes.ok) {
          const playbookData = await playbookRes.json();
          const playbooks = playbookData.playbooks || [];
          allFiles.push(...playbooks.map(p => ({
            ...p,
            source: 'Playbook',
            timestamp: p.createdAt || p.updatedAt,
          })));
        }
      } catch (e) {
        console.error('Error loading playbooks:', e);
      }

      try {
        const practicesRes = await fetch('/api/practices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (practicesRes.ok) {
          const practicesData = await practicesRes.json();
          const practices = practicesData.data || [];
          allFiles.push(...practices.map(p => ({
            ...p,
            name: p.title,
            source: 'Practices',
            timestamp: p.createdAt || p.updatedAt,
          })));
        }
      } catch (e) {
        console.error('Error loading practices:', e);
      }

      try {
        const scoutingRes = await fetch('/api/scouting', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (scoutingRes.ok) {
          const scoutingData = await scoutingRes.json();
          const scouting = scoutingData.data || [];
          allFiles.push(...scouting.map(s => ({
            ...s,
            name: s.playerName || s.opponent,
            source: 'Scouting',
            timestamp: s.createdAt || s.updatedAt,
          })));
        }
      } catch (e) {
        console.error('Error loading scouting:', e);
      }

      // Sort by timestamp and get top 5
      const sortedFiles = allFiles
        .filter(f => f.timestamp)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      setRecentFiles(sortedFiles);

      // Load top players
      const rosterRes = await fetch('/api/roster?page=1&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rosterRes.ok) {
        const rosterData = await rosterRes.json();
        const players = rosterData.data || [];
        setTopPlayers(players);
      }

      // Load staff count
      const staffRes = await fetch('/api/staff?page=1&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaffCount(staffData.data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8), rgba(45, 53, 97, 0.6))', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 217, 255, 0.1)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)', transition: 'all 300ms ease-in-out' };

  return (
    <div style={{ padding: '0' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', background: 'linear-gradient(135deg, #00D9FF, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Dashboard
      </h1>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Next Game */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Calendar size={32} style={{ color: '#7FFF00' }} />
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase' }}>Next Game</h3>
          </div>
          {nextGame ? (
            <>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00D9FF', marginBottom: '0.5rem' }}>
                {nextGame.opponent || 'TBD'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#7FFF00', fontWeight: '600' }}>
                {new Date(nextGame.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • In {daysUntilGame} day{daysUntilGame !== 1 ? 's' : ''}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>No upcoming games</div>
          )}
        </div>

        {/* Recent Files */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <FileText size={32} style={{ color: '#FF6B35' }} />
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase' }}>Recent Files</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#FF6B35', marginBottom: '0.5rem' }}>
            {recentFiles.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#7FFF00', fontWeight: '600' }}>Files uploaded</div>
        </div>

        {/* Total Players */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <TrendingUp size={32} style={{ color: '#00FF88' }} />
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase' }}>Roster</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#00FF88', marginBottom: '0.5rem' }}>
            {topPlayers.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#7FFF00', fontWeight: '600' }}>Players on roster</div>
        </div>

        {/* Staff Count */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Users size={32} style={{ color: '#A78BFA' }} />
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase' }}>Staff</h3>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#A78BFA', marginBottom: '0.5rem' }}>
            {staffCount}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#7FFF00', fontWeight: '600' }}>Staff members</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/playbook')}
          style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(0, 217, 255, 0.05))',
            border: '2px solid rgba(0, 217, 255, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            transition: 'all 300ms ease',
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.25), rgba(0, 217, 255, 0.1))';
            e.target.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(0, 217, 255, 0.05))';
            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.4)';
          }}
        >
          <Plus size={32} style={{ color: '#00D9FF', marginBottom: '0.5rem' }} />
          <span style={{ color: '#00D9FF', fontWeight: '600', fontSize: '0.9rem' }}>Add Playbook</span>
        </button>

        <button
          onClick={() => navigate('/practices')}
          style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 107, 53, 0.05))',
            border: '2px solid rgba(255, 107, 53, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            transition: 'all 300ms ease',
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(255, 107, 53, 0.25), rgba(255, 107, 53, 0.1))';
            e.target.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 107, 53, 0.05))';
            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.4)';
          }}
        >
          <Upload size={32} style={{ color: '#FF6B35', marginBottom: '0.5rem' }} />
          <span style={{ color: '#FF6B35', fontWeight: '600', fontSize: '0.9rem' }}>Upload Video</span>
        </button>
      </div>

      {/* Top Players */}
      {topPlayers.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> Top Players
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {topPlayers.map((player, idx) => (
              <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '0.5rem', borderLeft: '3px solid #00D9FF' }}>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.9rem' }}>#{idx + 1} {player.name}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{player.position}</div>
                </div>
                <div style={{ background: 'rgba(0, 217, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.35rem', color: '#00D9FF', fontWeight: '600', fontSize: '0.875rem' }}>
                  #{player.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Files List */}
      {recentFiles.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} /> Latest Uploads
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recentFiles.map((file) => (
              <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255, 107, 53, 0.05)', borderRadius: '0.5rem', borderLeft: '3px solid #FF6B35' }}>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.9rem' }}>{file.name}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{file.side} • {file.fileType}</div>
                </div>
                <div style={{ color: '#7FFF00', fontSize: '0.75rem' }}>
                  {new Date(file.createdAt).toLocaleDateString('en-US')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(127, 255, 0, 0.05))', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#00D9FF', fontSize: '1.5rem' }}>🏀 Welcome to GEAS Basket</h2>
        <p style={{ margin: 0, color: '#cbd5e1' }}>Select a section from the menu to start managing your team.</p>
      </div>
    </div>
  );
}
