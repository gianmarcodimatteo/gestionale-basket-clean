import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { useToast } from '../context/ToastContext';
import { setToastCallback, setNavigateCallback } from '../utils/apiClient';
import { Menu, X, Home, Users, Grid, Calendar, Dumbbell, BookOpen, Crosshair, Settings, LogOut, User, Shield } from 'lucide-react';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import GeasLogo from '../assets/Logo-GEAS-2.png';
import '../styles/Layout.css';

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Staff', path: '/staff', icon: Users },
  { label: 'Roster', path: '/roster', icon: Grid },
  { label: 'Calendar', path: '/calendar', icon: Calendar },
  { label: 'Practices', path: '/practices', icon: Dumbbell },
  { label: 'Practices Shooting Stats', path: '/practices-shooting', icon: Crosshair },
  { label: 'Playbook', path: '/playbook', icon: BookOpen },
  { label: 'Scouting', path: '/scouting', icon: Crosshair },
  { label: 'Coaches', path: '/coaches', icon: Crosshair },
  { label: 'My Profile', path: '/my-profile', icon: User },
  { label: 'Organization', path: '/organization', icon: Settings },
];

export default function LayoutWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { addToast } = useToast();

  useEffect(() => {
    setToastCallback(addToast);
    setNavigateCallback(navigate);
  }, [addToast, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <img src={GeasLogo} alt="GEAS Basket" className="logo-icon" />
            {sidebarOpen && <span className="logo-text">GEAS</span>}
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

          {isAdmin && (
            <>
              <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.1)', margin: '1rem 0' }} />
              <Link
                to="/admin"
                className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                title="Admin Panel"
              >
                <Shield size={20} className="nav-icon" />
                {sidebarOpen && <span className="nav-label">Admin Panel</span>}
              </Link>
            </>
          )}

          {/* Logout button - visible on mobile navbar */}
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{
              display: window.innerWidth <= 480 ? 'flex' : 'none',
              background: 'rgba(255, 56, 96, 0.1)',
              color: '#FF5860',
              border: 'none',
              cursor: 'pointer',
              marginTop: 'auto',
              marginLeft: 'auto',
            }}
            title="Logout"
          >
            <LogOut size={20} className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                background: 'rgba(255, 56, 96, 0.1)',
                color: '#FF5860',
                padding: '0.75rem',
                border: '1px solid rgba(255, 56, 96, 0.2)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                transition: 'all 300ms ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 56, 96, 0.2)';
                e.target.style.boxShadow = '0 0 15px rgba(255, 56, 96, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 56, 96, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <LogOut size={16} /> Logout
            </button>
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
            <h1 className="page-title">GEAS Basket</h1>
          </div>
          <div className="header-right">
            <NotificationBell onClick={() => setNotificationPanelOpen(!notificationPanelOpen)} />
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span className="live-text">Live</span>
            </div>
          </div>
        </header>

        <NotificationPanel isOpen={notificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} />

        {/* Content - Outlet renders the page component */}
        <main className="content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>Digital Property of Gianmarco Di Matteo</p>
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
