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
      const response = await fetch('/api/roster?limit=100', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();
      setPlayers(result.data || []);
      const savedStats = JSON.parse(localStorage.getItem('shootingStats') || '{}');
      setStats(savedStats);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
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

  const addRecord = () => {
    if (!newDate) return;

    const hasData = SHOOTING_ZONES.some(zone => newZoneData[zone.id].made || newZoneData[zone.id].attempted);
    if (!hasData) return;

    const key = `${player.id}-${shotType}`;
    if (!stats[key]) stats[key] = {};

    stats[key][newDate] = SHOOTING_ZONES.reduce((acc, zone) => ({
      ...acc,
      [zone.id]: {
        made: parseInt(newZoneData[zone.id].made) || 0,
        attempted: parseInt(newZoneData[zone.id].attempted) || 0,
      }
    }), {});

    setStats({ ...stats });
    localStorage.setItem('shootingStats', JSON.stringify(stats));
    loadDailyStats();
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewZoneData(SHOOTING_ZONES.reduce((acc, zone) => ({ ...acc, [zone.id]: { made: '', attempted: '' } }), {}));
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
                  <td className="notes-col">-</td>
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
