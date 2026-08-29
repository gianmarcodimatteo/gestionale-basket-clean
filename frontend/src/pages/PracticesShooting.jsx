import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import '../styles/PracticesShooting.css';

const SHOOTING_ZONES = [
  { id: 'LH_COR', label: 'LEFT CORNER' },
  { id: 'LH_WG', label: 'LEFT WING' },
  { id: 'TOP', label: 'TOP OF KEY' },
  { id: 'RT_WG', label: 'RIGHT WING' },
  { id: 'RT_COR', label: 'RIGHT CORNER' },
];

export default function PracticesShooting() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [shotType, setShotType] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const canEdit = ['ADMIN', 'EDITOR'].includes(userRole);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      console.log('🏀 PracticesShooting: Starting to load players and stats...');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/roster?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      console.log('✅ Loaded players:', result.data?.length || 0);
      setPlayers(result.data || []);

      // Load stats from API for all players
      const allStats = {};
      let hasApiData = false;

      for (const player of (result.data || [])) {
        try {
          const statsResponse = await fetch(`/api/shooting-stats?rosterId=${player.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!statsResponse.ok) {
            console.warn(`⚠️ API returned ${statsResponse.status} for player ${player.id}`);
            continue;
          }

          const statsResult = await statsResponse.json();
          console.log(`📊 Stats for player ${player.id}:`, statsResult.data?.length || 0, 'records');

          if (statsResult.success && statsResult.data && statsResult.data.length > 0) {
            hasApiData = true;
            statsResult.data.forEach(stat => {
              const key = `${player.id}-${stat.shotType || '2PTS'}`;
              if (!allStats[key]) allStats[key] = {};
              const dateKey = stat.date ? new Date(stat.date).toISOString().split('T')[0] : stat.date;
              allStats[key][dateKey] = {
                id: stat.id,
                LH_COR: { made: stat.lhCorM || 0, attempted: stat.lhCorA || 0 },
                LH_WG: { made: stat.lhWgM || 0, attempted: stat.lhWgA || 0 },
                TOP: { made: stat.topM || 0, attempted: stat.topA || 0 },
                RT_WG: { made: stat.rtWgM || 0, attempted: stat.rtWgA || 0 },
                RT_COR: { made: stat.rtCorM || 0, attempted: stat.rtCorA || 0 },
              };
            });
          }
        } catch (err) {
          console.error(`❌ Error loading stats for player ${player.id}:`, err);
        }
      }

      // Fallback to localStorage if API has no data
      if (!hasApiData) {
        console.log('📱 No API data found, loading from localStorage');
        const savedStats = JSON.parse(localStorage.getItem('shootingStats') || '{}');
        console.log('💾 localStorage stats:', Object.keys(savedStats).length, 'entries');
        Object.assign(allStats, savedStats);
      }

      console.log('✅ Final stats object:', Object.keys(allStats).length, 'keys');
      setStats(allStats);
    } catch (error) {
      console.error('❌ Error loading players:', error);
      // Final fallback to localStorage on any error
      const savedStats = JSON.parse(localStorage.getItem('shootingStats') || '{}');
      console.log('💾 Fallback from localStorage:', Object.keys(savedStats).length, 'entries');
      setStats(savedStats);
    } finally {
      setLoading(false);
      console.log('✅ Page render complete');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#cbd5e1' }}>Loading...</div>;

  if (selectedPlayer && shotType) {
    return <PlayerStatsDetailView player={selectedPlayer} shotType={shotType} stats={stats} setStats={setStats} onClose={() => { setSelectedPlayer(null); setShotType(null); }} canEdit={canEdit} />;
  }

  return (
    <div className="page-container">
      <div className="shooting-header">
        <h1>🏀 Practices' Shooting Stats</h1>
      </div>

      <div className="players-table-container">
        <table className="players-table">
          <thead>
            <tr>
              <th>PLAYER</th>
              <th>2PTS</th>
              <th>3PTS</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: '#cbd5e1' }}>No players in roster</td>
              </tr>
            ) : (
              players.map(player => (
                <tr key={player.id}>
                  <td className="player-cell">
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <span className="player-position">{player.position} • #{player.number}</span>
                    </div>
                  </td>
                  <td>
                    <button className="shot-btn" onClick={() => { setSelectedPlayer(player); setShotType('2PTS'); }}>
                      2PTS
                    </button>
                  </td>
                  <td>
                    <button className="shot-btn" onClick={() => { setSelectedPlayer(player); setShotType('3PTS'); }}>
                      3PTS
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerStatsDetailView({ player, shotType, stats, setStats, onClose, canEdit }) {
  const [dailyStats, setDailyStats] = useState([]);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newZoneData, setNewZoneData] = useState(
    SHOOTING_ZONES.reduce((acc, zone) => ({ ...acc, [zone.id]: { made: '', attempted: '' } }), {})
  );

  useEffect(() => {
    loadDailyStats();
  }, [player, shotType]);

  const loadDailyStats = () => {
    const key = `${player.id}-${shotType}`;
    const playerStats = stats[key] || {};
    const records = Object.entries(playerStats)
      .map(([date, zones]) => ({ date, zones }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setDailyStats(records);
  };

  const addRecord = async () => {
    if (!newDate) return;

    const hasData = SHOOTING_ZONES.some(zone => newZoneData[zone.id].made || newZoneData[zone.id].attempted);
    if (!hasData) return;

    try {
      // Save to API
      const apiPayload = {
        rosterId: player.id,
        date: newDate,
        shotType: shotType,
        lhCorM: parseInt(newZoneData.LH_COR.made) || 0,
        lhCorA: parseInt(newZoneData.LH_COR.attempted) || 0,
        lhWgM: parseInt(newZoneData.LH_WG.made) || 0,
        lhWgA: parseInt(newZoneData.LH_WG.attempted) || 0,
        topM: parseInt(newZoneData.TOP.made) || 0,
        topA: parseInt(newZoneData.TOP.attempted) || 0,
        rtWgM: parseInt(newZoneData.RT_WG.made) || 0,
        rtWgA: parseInt(newZoneData.RT_WG.attempted) || 0,
        rtCorM: parseInt(newZoneData.RT_COR.made) || 0,
        rtCorA: parseInt(newZoneData.RT_COR.attempted) || 0,
      };

      console.log('📤 Saving to API:', apiPayload);

      const response = await fetch('/api/shooting-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(apiPayload),
      });

      console.log('📨 API Response:', response.status, response.statusText);
      const responseData = await response.json();
      console.log('📨 API Response Data:', responseData);

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${responseData.error || 'Failed to save stats'}`);
      }

      console.log('✅ Successfully saved to API!');

      // Update local state with ID from API response
      const key = `${player.id}-${shotType}`;
      if (!stats[key]) stats[key] = {};

      const savedRecord = responseData.data;
      stats[key][newDate] = {
        id: savedRecord.id,
        zones: SHOOTING_ZONES.reduce((acc, zone) => ({
          ...acc,
          [zone.id]: {
            made: parseInt(newZoneData[zone.id].made) || 0,
            attempted: parseInt(newZoneData[zone.id].attempted) || 0,
          }
        }), {})
      };

      console.log('📝 Updated local stats with ID:', savedRecord.id, 'and zones:', stats[key][newDate].zones);
      setStats({ ...stats });
      localStorage.setItem('shootingStats', JSON.stringify(stats));
      loadDailyStats();
      setNewDate(new Date().toISOString().split('T')[0]);
      setNewZoneData(SHOOTING_ZONES.reduce((acc, zone) => ({ ...acc, [zone.id]: { made: '', attempted: '' } }), {}));
      alert('✅ Stats saved successfully!');
    } catch (error) {
      console.error('❌ Error saving shooting stats:', error);
      alert('❌ Failed to save shooting stats:\n' + error.message);
    }
  };

  const deleteRecord = async (date) => {
    const stat = dailyStats.find(s => s.date === date);
    if (!stat || !stat.id) {
      alert('❌ Cannot delete: No ID found for this record');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the record for ${date}?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting record ID:', stat.id);

      const response = await fetch(`/api/shooting-stats/${stat.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('📨 Delete API Response:', response.status);

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      console.log('✅ Successfully deleted from API!');

      // Update local state
      const key = `${player.id}-${shotType}`;
      if (stats[key] && stats[key][date]) {
        delete stats[key][date];
        setStats({ ...stats });
        localStorage.setItem('shootingStats', JSON.stringify(stats));
        loadDailyStats();
        alert('✅ Record deleted successfully!');
      }
    } catch (error) {
      console.error('❌ Error deleting shooting stats:', error);
      alert('❌ Failed to delete record:\n' + error.message);
    }
  };

  const getColor = (percentage) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) return '#999';
    const val = parseFloat(percentage);
    if (val >= 75) return '#7FFF00';
    if (val >= 50) return '#FFD700';
    return '#FF6B6B';
  };

  const calculateTotals = (zoneDatas) => {
    return SHOOTING_ZONES.reduce((acc, zone) => ({
      made: acc.made + (zoneDatas[zone.id]?.made || 0),
      attempted: acc.attempted + (zoneDatas[zone.id]?.attempted || 0),
    }), { made: 0, attempted: 0 });
  };

  const allTimeStats = dailyStats.reduce((acc, day) => {
    const dayTotals = calculateTotals(day.zones);
    return {
      made: acc.made + dayTotals.made,
      attempted: acc.attempted + dayTotals.attempted,
    };
  }, { made: 0, attempted: 0 });

  const allTimePercentage = allTimeStats.attempted > 0 ? ((allTimeStats.made / allTimeStats.attempted) * 100).toFixed(1) : '0';

  return (
    <div className="player-stats-view">
      <div className="stats-header">
        <button onClick={onClose} className="back-btn">← Back</button>
        <div className="header-info">
          <h1>{player.name}</h1>
          <span className="header-type">{shotType}</span>
          <span className="header-position">{player.position} • #{player.number}</span>
        </div>
      </div>

      <div className="stats-table-detail-container">
        <table className="stats-table-detail">
          <thead>
            <tr>
              <th>DATE</th>
              {SHOOTING_ZONES.map(zone => (
                <th key={zone.id} colSpan="3">{zone.label}</th>
              ))}
              <th colSpan="3">TOTAL</th>
              <th>NOTES</th>
            </tr>
            <tr className="subheader">
              <th></th>
              {SHOOTING_ZONES.map(zone => (
                <React.Fragment key={zone.id}>
                  <th>M</th>
                  <th>/A</th>
                  <th>%</th>
                </React.Fragment>
              ))}
              <th>M</th>
              <th>/A</th>
              <th>%</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {canEdit && (
              <tr className="input-row">
                <td className="date-col">
                  <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="table-input" />
                </td>
                {SHOOTING_ZONES.map(zone => (
                  <React.Fragment key={zone.id}>
                    <td className="made-col">
                      <input type="number" min="0" value={newZoneData[zone.id].made} onChange={(e) => setNewZoneData({ ...newZoneData, [zone.id]: { ...newZoneData[zone.id], made: e.target.value } })} placeholder="0" className="table-input" />
                    </td>
                    <td className="attempted-col">
                      <input type="number" min="0" value={newZoneData[zone.id].attempted} onChange={(e) => setNewZoneData({ ...newZoneData, [zone.id]: { ...newZoneData[zone.id], attempted: e.target.value } })} placeholder="0" className="table-input" />
                    </td>
                    <td className="percent-col">-</td>
                  </React.Fragment>
                ))}
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  <button className="add-inline-btn" onClick={addRecord}>✓ Add</button>
                </td>
                <td></td>
              </tr>
            )}
            {dailyStats.map((stat, idx) => {
              const totals = calculateTotals(stat.zones);
              const totalPercentage = totals.attempted > 0 ? ((totals.made / totals.attempted) * 100).toFixed(1) : '0';
              return (
                <tr key={idx}>
                  <td className="date-col">{stat.date}</td>
                  {SHOOTING_ZONES.map(zone => {
                    const zoneData = stat.zones[zone.id];
                    const percentage = zoneData.attempted > 0 ? ((zoneData.made / zoneData.attempted) * 100).toFixed(1) : '0';
                    return (
                      <React.Fragment key={zone.id}>
                        <td className="made-col">{zoneData.made}</td>
                        <td className="attempted-col">/{zoneData.attempted}</td>
                        <td className="percent-col" style={{ color: getColor(percentage) }}>{percentage}%</td>
                      </React.Fragment>
                    );
                  })}
                  <td className="made-col"><strong>{totals.made}</strong></td>
                  <td className="attempted-col"><strong>/{totals.attempted}</strong></td>
                  <td className="percent-col" style={{ color: getColor(totalPercentage) }}><strong>{totalPercentage}%</strong></td>
                  <td className="notes-col">
                    {canEdit && stat.id && (
                      <button
                        onClick={() => deleteRecord(stat.date)}
                        style={{
                          background: 'rgba(255, 88, 96, 0.2)',
                          color: '#FF5860',
                          border: '1px solid rgba(255, 88, 96, 0.3)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '0.35rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255, 88, 96, 0.3)';
                          e.target.style.boxShadow = '0 0 10px rgba(255, 88, 96, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255, 88, 96, 0.2)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="totals-row">
              <td><strong>TOTALE</strong></td>
              {SHOOTING_ZONES.map(zone => {
                const allTimeMade = dailyStats.reduce((sum, day) => sum + (day.zones[zone.id]?.made || 0), 0);
                const allTimeAttempted = dailyStats.reduce((sum, day) => sum + (day.zones[zone.id]?.attempted || 0), 0);
                const percentage = allTimeAttempted > 0 ? ((allTimeMade / allTimeAttempted) * 100).toFixed(1) : '0';
                return (
                  <React.Fragment key={zone.id}>
                    <td className="made-col"><strong>{allTimeMade}</strong></td>
                    <td className="attempted-col"><strong>/{allTimeAttempted}</strong></td>
                    <td className="percent-col" style={{ color: getColor(percentage) }}><strong>{percentage}%</strong></td>
                  </React.Fragment>
                );
              })}
              <td className="made-col"><strong>{allTimeStats.made}</strong></td>
              <td className="attempted-col"><strong>/{allTimeStats.attempted}</strong></td>
              <td className="percent-col" style={{ color: getColor(allTimePercentage) }}><strong>{allTimePercentage}%</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
