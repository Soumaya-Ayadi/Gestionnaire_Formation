import React, { useEffect, useState } from 'react';
import api from '../services/api.jsx';
import { useAuth } from '../services/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ formations: 0, participants: 0, formateurs: 0 });

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
      }).catch(() => {});
    }
  }, [user]);

  const renderAdminDashboard = () => (
    <>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Bienvenue, <strong>{user?.login}</strong>. Voici un aperçu de l'activité du centre.
      </p>

      <div className="stats-row">
        <div className="stat-card blue">
          <div className="label">Formations enregistrées</div>
          <div className="value">{counts.formations}</div>
        </div>
        <div className="stat-card green">
          <div className="label">Participants</div>
          <div className="value">{counts.participants}</div>
        </div>
        <div className="stat-card orange">
          <div className="label">Formateurs</div>
          <div className="value">{counts.formateurs}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Accès rapide</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/formations" className="btn btn-ghost">📋 Voir les formations</a>
          <a href="/participants" className="btn btn-ghost">👥 Voir les participants</a>
          <a href="/formateurs" className="btn btn-ghost">🎓 Voir les formateurs</a>
          <a href="/statistiques" className="btn btn-ghost">📊 Statistiques</a>
          <a href="/utilisateurs" className="btn btn-ghost">👤 Gestion des utilisateurs</a>
        </div>
      </div>
    </>
  );

  const renderUserDashboard = () => (
    <>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Bienvenue, <strong>{user?.login}</strong>. Voici un aperçu de l'activité du centre.
      </p>

      <div className="stats-row">
        <div className="stat-card blue">
          <div className="label">Formations enregistrées</div>
          <div className="value">{counts.formations}</div>
        </div>
        <div className="stat-card green">
          <div className="label">Participants</div>
          <div className="value">{counts.participants}</div>
        </div>
        <div className="stat-card orange">
          <div className="label">Formateurs</div>
          <div className="value">{counts.formateurs}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Accès rapide</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/formations" className="btn btn-ghost">📋 Voir les formations</a>
          <a href="/participants" className="btn btn-ghost">👥 Voir les participants</a>
          <a href="/formateurs" className="btn btn-ghost">🎓 Voir les formateurs</a>
        </div>
      </div>
    </>
  );

  const renderResponsableDashboard = () => (
    <>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        Bienvenue, <strong>{user?.login}</strong>. Vous pouvez consulter les statistiques du centre.
      </p>

      <div className="card">
        <div className="card-header">
          <h3>Tableau de bord</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/statistiques" className="btn btn-primary">📊 Consulter les statistiques</a>
        </div>
      </div>
    </>
  );

  if (user?.role === 'ROLE_ADMIN') {
    return renderAdminDashboard();
  } else if (user?.role === 'ROLE_USER') {
    return renderUserDashboard();
  } else if (user?.role === 'ROLE_RESPONSABLE') {
    return renderResponsableDashboard();
  }

  return <div>Chargement...</div>;
}
