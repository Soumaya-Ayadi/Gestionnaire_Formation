import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext.jsx';

const NAV = [
  { to: '/',             icon: '⊞',  label: 'Tableau de bord', end: true },
  { to: '/formations',   icon: '📋', label: 'Formations' },
  { to: '/participants', icon: '👥', label: 'Participants' },
  { to: '/formateurs',   icon: '🎓', label: 'Formateurs' },
  { to: '/statistiques', icon: '📊', label: 'Statistiques',   roles: ['ROLE_ADMIN', 'ROLE_RESPONSABLE'] },
];

const ADMIN_NAV = [
  { to: '/referentiels', icon: '🗂️',  label: 'Référentiels' },
  { to: '/utilisateurs', icon: '🔑',  label: 'Utilisateurs' },
];

function pageTitle(pathname) {
  const map = {
    '/': 'Tableau de bord',
    '/formations': 'Formations',
    '/participants': 'Participants',
    '/formateurs': 'Formateurs',
    '/statistiques': 'Statistiques',
    '/referentiels': 'Référentiels',
    '/utilisateurs': 'Utilisateurs',
  };
  return map[pathname] || 'Gestion Formation';
}

export default function Layout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const canSeeStats = ['ROLE_ADMIN', 'ROLE_RESPONSABLE'].includes(user?.role);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Excellent Training</h2>
          <p>Gestion de Formation</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Navigation</div>
          {NAV.filter(n => !n.roles || n.roles.some(r => r === user?.role)).map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">{n.icon}</span> {n.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="nav-section" style={{ marginTop: 12 }}>Administration</div>
              {ADMIN_NAV.map(n => (
                <NavLink key={n.to} to={n.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="icon">{n.icon}</span> {n.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontWeight: 500, color: '#fff', fontSize: 13 }}>{user?.login}</div>
          <div style={{ fontSize: 11, marginTop: 2 }}>
            {user?.role?.replace('ROLE_', '')}
          </div>
          <button onClick={signOut}>Se déconnecter →</button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <h1>{pageTitle(pathname)}</h1>
          <span className="badge">{user?.role?.replace('ROLE_', '')}</span>
        </div>
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
