import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, Grid, Calendar, Dumbbell, BookOpen, Crosshair, Gamepad2, Settings, Clipboard } from 'lucide-react';
import '../styles/Layout.css';

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Staff', path: '/staff', icon: Users },
  { label: 'Roster', path: '/roster', icon: Grid },
  { label: 'Calendario', path: '/calendar', icon: Calendar },
  { label: 'Allenamenti', path: '/trainings', icon: Dumbbell },
  { label: "Practices' Shooting Stats", path: '/practices-shooting', icon: Dumbbell },
  { label: 'Playbook', path: '/playbook', icon: BookOpen },
  { label: 'Scouting', path: '/scouting', icon: Crosshair },
  { label: 'Coaches', path: '/coaches', icon: Crosshair },
  { label: 'Game Card', path: '/game-card', icon: Gamepad2 },
  { label: 'Organizzazione', path: '/organization', icon: Settings },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <span className="logo-icon">🏀</span>
            {sidebarOpen && <span className="logo-text">Gestionale</span>}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={20} className="nav-icon" />
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">👩‍💼</div>
              <div className="user-details">
                <div className="user-name">Coach</div>
                <div className="user-status">Online</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            {!sidebarOpen && (
              <button
                className="header-menu-btn"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={24} />
              </button>
            )}
            <h1 className="page-title">Gestionale Basket</h1>
          </div>
          <div className="header-right">
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span className="live-text">Live</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          {children}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© 2025 Gestionale Pallacanestro Femminile - Campania</p>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
