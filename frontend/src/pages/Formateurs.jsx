import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';

const EMPTY = { nom: '', prenom: '', email: '', tel: '', type: 'INTERNE', employeurId: '' };

export default function Formateurs() {
  const [formateurs, setFormateurs] = useState([]);
  const [employeurs, setEmployeurs] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [fo, em] = await Promise.all([api.get('/formateurs'), api.get('/employeurs')]);
    setFormateurs(fo.data); setEmployeurs(em.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true); };
  const openEdit = (fo) => {
    setEditing(fo);
    setForm({ nom: fo.nom, prenom: fo.prenom, email: fo.email, tel: fo.tel || '', type: fo.type, employeurId: fo.employeur?.id || '' });
    setError(''); setModal(true);
  };

  const save = async () => {
    setError('');
    try {
      const payload = { ...form, employeurId: form.employeurId ? Number(form.employeurId) : null };
      if (editing) await api.put(`/formateurs/${editing.id}`, payload);
      else await api.post('/formateurs', payload);
      setModal(false); load();
    } catch (e) {
      setError(e.response?.data?.error || JSON.stringify(e.response?.data) || 'Erreur');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer ce formateur ?')) return;
    await api.delete(`/formateurs/${id}`); load();
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div>
      <div className="flex-between mb-24">
        <span style={{ color: 'var(--muted)' }}>{formateurs.length} formateur(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouveau formateur</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Type</th><th>Employeur</th><th></th></tr>
            </thead>
            <tbody>
              {formateurs.length === 0 && (
                <tr><td colSpan={6}><div className="empty"><div className="empty-icon">🎓</div>Aucun formateur</div></td></tr>
              )}
              {formateurs.map(fo => (
                <tr key={fo.id}>
                  <td style={{ fontWeight: 500 }}>{fo.nom}</td>
                  <td>{fo.prenom}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{fo.email}</td>
                  <td>
                    <span className={`pill ${fo.type === 'INTERNE' ? 'pill-green' : 'pill-orange'}`}>
                      {fo.type}
                    </span>
                  </td>
                  <td>{fo.employeur?.nomEmployeur || '—'}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(fo)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(fo.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>{editing ? 'Modifier le formateur' : 'Nouveau formateur'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-grid">
              <div className="form-group"><label>Nom *</label><input value={form.nom} onChange={f('nom')} /></div>
              <div className="form-group"><label>Prénom *</label><input value={form.prenom} onChange={f('prenom')} /></div>
              <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={f('email')} /></div>
              <div className="form-group"><label>Téléphone</label><input value={form.tel} onChange={f('tel')} /></div>
              <div className="form-group">
                <label>Type *</label>
                <select value={form.type} onChange={f('type')}>
                  <option value="INTERNE">Interne</option>
                  <option value="EXTERNE">Externe</option>
                </select>
              </div>
              {form.type === 'EXTERNE' && (
                <div className="form-group">
                  <label>Employeur *</label>
                  <select value={form.employeurId} onChange={f('employeurId')}>
                    <option value="">-- Sélectionner --</option>
                    {employeurs.map(e => <option key={e.id} value={e.id}>{e.nomEmployeur}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={save}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
