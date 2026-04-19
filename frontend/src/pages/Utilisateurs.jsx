import React, { useEffect, useState } from 'react';
import api from '../services/api.jsx';

const EMPTY = { login: '', email: '', role: 'ROLE_USER' };

export default function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const { data } = await api.get('/utilisateurs');
    setUsers(data);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setError(''); setSuccess(''); setModal(true); };

  const save = async () => {
    setError(''); setSuccess('');
    try {
      await api.post('/auth/create-user', form);
      setSuccess('Compte créé. Les identifiants ont été envoyés par email.');
      setTimeout(() => { setModal(false); load(); }, 1500);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la création.');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/utilisateurs/${id}`); load();
  };

  const roleLabel = (r) => ({ ROLE_ADMIN: 'Admin', ROLE_USER: 'Utilisateur', ROLE_RESPONSABLE: 'Responsable' })[r] || r;
  const rolePill  = (r) => ({ ROLE_ADMIN: 'pill-orange', ROLE_USER: 'pill-blue', ROLE_RESPONSABLE: 'pill-green' })[r] || 'pill-gray';

  return (
    <div>
      <div className="flex-between mb-24">
        <span style={{ color: 'var(--muted)' }}>{users.length} utilisateur(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Créer un compte</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Login</th><th>Email</th><th>Rôle</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.login}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{u.email}</td>
                  <td><span className={`pill ${rolePill(u.role?.nom)}`}>{roleLabel(u.role?.nom)}</span></td>
                  <td><span className={`pill ${u.active ? 'pill-green' : 'pill-gray'}`}>{u.active ? 'Actif' : 'Inactif'}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => del(u.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ width: 420 }}>
            <h2>Créer un compte utilisateur</h2>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 20 }}>
              Un mot de passe aléatoire sera généré et envoyé par email à l'utilisateur.
            </p>
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="form-group mb-16">
              <label>Login *</label>
              <input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} placeholder="min. 3 caractères" />
            </div>
            <div className="form-group mb-16">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group mb-16">
              <label>Rôle *</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="ROLE_USER">Utilisateur simple</option>
                <option value="ROLE_RESPONSABLE">Responsable de centre</option>
                <option value="ROLE_ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={save}>Créer le compte</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
