import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';

const EMPTY = { nom: '', prenom: '', email: '', tel: '', structureId: '', profilId: '' };

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [structures, setStructures] = useState([]);
  const [profils, setProfils] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [historyModal, setHistoryModal] = useState(null);
  const [history, setHistory] = useState([]);

  const load = useCallback(async () => {
    const [p, s, pr] = await Promise.all([api.get('/participants'), api.get('/structures'), api.get('/profils')]);
    setParticipants(p.data); setStructures(s.data); setProfils(pr.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ nom: p.nom, prenom: p.prenom, email: p.email || '', tel: p.tel || '', structureId: p.structure?.id || '', profilId: p.profil?.id || '' });
    setError(''); setModal(true);
  };

  const openHistory = async (p) => {
    const { data } = await api.get(`/participants/${p.id}/formations`);
    setHistory(data); setHistoryModal(p);
  };

  const save = async () => {
    setError('');
    try {
      const payload = { ...form, structureId: Number(form.structureId), profilId: Number(form.profilId) };
      if (editing) await api.put(`/participants/${editing.id}`, payload);
      else await api.post('/participants', payload);
      setModal(false); load();
    } catch (e) {
      setError(e.response?.data?.error || JSON.stringify(e.response?.data) || 'Erreur');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer ce participant ?')) return;
    await api.delete(`/participants/${id}`); load();
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div>
      <div className="flex-between mb-24">
        <span style={{ color: 'var(--muted)' }}>{participants.length} participant(s)</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouveau participant</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Structure</th><th>Profil</th><th>Formations</th><th></th></tr>
            </thead>
            <tbody>
              {participants.length === 0 && (
                <tr><td colSpan={7}><div className="empty"><div className="empty-icon">👥</div>Aucun participant</div></td></tr>
              )}
              {participants.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.nom}</td>
                  <td>{p.prenom}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{p.email || '—'}</td>
                  <td><span className="pill pill-gray">{p.structure?.libelle}</span></td>
                  <td>{p.profil?.libelle}</td>
                  <td><span className="pill pill-blue">{p.formationIds?.length || 0}</span></td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => openHistory(p)}>Historique</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>{editing ? 'Modifier le participant' : 'Nouveau participant'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-grid">
              <div className="form-group"><label>Nom *</label><input value={form.nom} onChange={f('nom')} /></div>
              <div className="form-group"><label>Prénom *</label><input value={form.prenom} onChange={f('prenom')} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={f('email')} /></div>
              <div className="form-group"><label>Téléphone</label><input value={form.tel} onChange={f('tel')} /></div>
              <div className="form-group">
                <label>Structure *</label>
                <select value={form.structureId} onChange={f('structureId')}>
                  <option value="">-- Sélectionner --</option>
                  {structures.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Profil *</label>
                <select value={form.profilId} onChange={f('profilId')}>
                  <option value="">-- Sélectionner --</option>
                  {profils.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={save}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {historyModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setHistoryModal(null)}>
          <div className="modal">
            <h2>Formations de {historyModal.prenom} {historyModal.nom}</h2>
            {history.length === 0
              ? <div className="empty"><div className="empty-icon">📋</div>Aucune formation</div>
              : <table>
                  <thead><tr><th>Titre</th><th>Année</th><th>Domaine</th><th>Durée</th></tr></thead>
                  <tbody>
                    {history.map(f => (
                      <tr key={f.id}>
                        <td>{f.titre}</td>
                        <td><span className="pill pill-blue">{f.annee}</span></td>
                        <td>{f.domaine?.libelle}</td>
                        <td>{f.duree}j</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setHistoryModal(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
