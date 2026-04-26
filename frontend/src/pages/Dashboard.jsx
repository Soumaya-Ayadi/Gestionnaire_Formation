import { useEffect, useState } from 'react';
import api from '../services/api.jsx';
import { useAuth } from '../services/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ formations: 0, participants: 0, formateurs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_USER') {
      Promise.all([
        api.get('/formations'),
        api.get('/participants'),
        api.get('/formateurs'),
      ]).then(([f, p, fo]) => {
        setCounts({
          formations: f.data.length,
          participants: p.data.length,
          formateurs: fo.data.length,
        });
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const QUICK_LINKS_ADMIN = [
    { href: '/formations',   emoji: '📋', label: 'Formations' },
    { href: '/participants', emoji: '👥', label: 'Participants' },
    { href: '/formateurs',   emoji: '🎓', label: 'Formateurs' },
    { href: '/statistiques', emoji: '📊', label: 'Statistiques' },
    { href: '/utilisateurs', emoji: '🔑', label: 'Utilisateurs' },
    { href: '/referentiels', emoji: '🗂️',  label: 'Référentiels' },
  ];
  const QUICK_LINKS_USER = [
    { href: '/formations',   emoji: '📋', label: 'Formations' },
    { href: '/participants', emoji: '👥', label: 'Participants' },
    { href: '/formateurs',   emoji: '🎓', label: 'Formateurs' },
    { href: '/referentiels', emoji: '🗂️',  label: 'Référentiels' },
  ];

  const renderStats = () => (
    <div className="stats-row">
      {[
        { label: 'Formations', value: counts.formations, icon: '📋', cls: 'blue' },
        { label: 'Participants', value: counts.participants, icon: '👥', cls: 'green' },
        { label: 'Formateurs', value: counts.formateurs, icon: '🎓', cls: 'orange' },
      ].map(s => (
        <div className={`stat-card ${s.cls}`} key={s.label}>
          <div className="stat-header">
            <div>
              <div className="label">{s.label}</div>
              <div className="value">{loading ? '—' : s.value}</div>
            </div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAdminDashboard = () => (
    <>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Bienvenue, <strong style={{ color: 'var(--text)' }}>{user?.login}</strong>. Voici un aperçu de l&apos;activité du centre.
        </p>
      </div>
      {renderStats()}
      <div className="card">
        <div className="card-header">
          <h3><span className="card-icon" style={{ background: 'var(--primary-soft)', fontSize: 13 }}>⚡</span>Accès rapide</h3>
        </div>
        <div className="card-body">
          <div className="quick-links">
            {QUICK_LINKS_ADMIN.map(l => (
              <a key={l.href} href={l.href} className="quick-link">
                <span>{l.emoji}</span> {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderUserDashboard = () => (
    <>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Bienvenue, <strong style={{ color: 'var(--text)' }}>{user?.login}</strong>. Voici un aperçu de l&apos;activité du centre.
        </p>
      </div>
      {renderStats()}
      <div className="card">
        <div className="card-header">
          <h3><span className="card-icon" style={{ background: 'var(--primary-soft)' }}>⚡</span>Accès rapide</h3>
        </div>
        <div className="card-body">
          <div className="quick-links">
            {QUICK_LINKS_USER.map(l => (
              <a key={l.href} href={l.href} className="quick-link">
                <span>{l.emoji}</span> {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderResponsableDashboard = () => (
    <>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Bienvenue, <strong style={{ color: 'var(--text)' }}>{user?.login}</strong>. Vous pouvez consulter les statistiques du centre.
        </p>
      </div>
      <div className="card" style={{ borderTop: '3px solid var(--primary)' }}>
        <div className="card-body" style={{ padding: '32px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📊</div>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>Tableau de bord statistique</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            Accédez aux analyses et rapports détaillés sur l&apos;activité du centre.
          </p>
          <a href="/statistiques" className="btn btn-primary">Consulter les statistiques →</a>
        </div>
      </div>
    </>
  );

  if (user?.role === 'ROLE_ADMIN') return renderAdminDashboard();
  if (user?.role === 'ROLE_USER') return renderUserDashboard();
  if (user?.role === 'ROLE_RESPONSABLE') return renderResponsableDashboard();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted)' }}>
      Chargement…
    </div>
  );
}