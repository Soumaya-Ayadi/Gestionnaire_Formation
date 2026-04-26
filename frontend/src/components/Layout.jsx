import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext.jsx';

const NAV = [
  { to: '/',             icon: '⊞',  label: 'Tableau de bord', end: true },
  { to: '/formations',   icon: '📋', label: 'Formations',       roles: ['ROLE_ADMIN', 'ROLE_USER'] },
  { to: '/participants', icon: '👥', label: 'Participants',     roles: ['ROLE_ADMIN', 'ROLE_USER'] },
  { to: '/formateurs',   icon: '🎓', label: 'Formateurs',       roles: ['ROLE_ADMIN', 'ROLE_USER'] },
  { to: '/statistiques', icon: '📊', label: 'Statistiques',     roles: ['ROLE_ADMIN', 'ROLE_RESPONSABLE'] },
  { to: '/referentiels', icon: '🗂️',  label: 'Référentiels',    roles: ['ROLE_ADMIN', 'ROLE_USER'] },
];

const ADMIN_NAV = [
  { to: '/utilisateurs', icon: '🔑', label: 'Utilisateurs' },
];

const PAGE_META = {
  '/':             { title: 'Tableau de bord', sub: 'Vue générale' },
  '/formations':   { title: 'Formations',       sub: 'Planification & suivi' },
  '/participants': { title: 'Participants',     sub: 'Gestion des inscrits' },
  '/formateurs':   { title: 'Formateurs',       sub: 'Équipe pédagogique' },
  '/statistiques': { title: 'Statistiques',     sub: 'Analyses & rapports' },
  '/referentiels': { title: 'Référentiels',     sub: 'Données de référence' },
  '/utilisateurs': { title: 'Utilisateurs',     sub: 'Gestion des accès' },
};

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrateur',
  ROLE_USER: 'Utilisateur',
  ROLE_RESPONSABLE: 'Responsable',
};

export default function Layout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const meta = PAGE_META[pathname] || { title: 'Green Building', sub: '' };

  const initials = user?.login
    ? user.login.slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div>
            <h2>Green Building</h2>
            <p>Gestion de Formation</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Navigation</div>
          {NAV.filter(n => !n.roles || n.roles.some(r => r === user?.role)).map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="nav-section" style={{ marginTop: 16 }}>Administration</div>
              {ADMIN_NAV.map(n => (
                <NavLink key={n.to} to={n.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="icon">{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.login}</div>
              <div className="sidebar-user-role">{ROLE_LABELS[user?.role] || user?.role}</div>
            </div>
            <button className="sidebar-signout" onClick={signOut} title="Se déconnecter">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{meta.title}</h1>
            {meta.sub && (
              <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>— {meta.sub}</span>
            )}
          </div>
          <span className="badge">{user?.role?.replace('ROLE_', '')}</span>
        </div>
        <div className="page animate-fade-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}