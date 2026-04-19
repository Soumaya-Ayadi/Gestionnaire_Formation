import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';

const EMPTY_FORM = { titre: '', annee: new Date().getFullYear(), duree: 1, budget: '', lieu: '', domaineId: '', formateurId: '', participantIds: [] };

export default function Formations() {
  const [formations, setFormations] = useState([]);
  const [domaines, setDomaines]     = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [error, setError]   = useState('');
  const [filterAnnee, setFilterAnnee] = useState('');

  const load = useCallback(async () => {
    const url = filterAnnee ? `/formations?annee=${filterAnnee}` : '/formations';
    const [f, d, fo, p] = await Promise.all([
      api.get(url), api.get('/domaines'), api.get('/formateurs'), api.get('/participants')
    ]);
    setFormations(f.data); setDomaines(d.data); setFormateurs(fo.data); setParticipants(p.data);
  }, [filterAnnee]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setModal(true); };
  const openEdit   = (f) => {
    setEditing(f);
    setForm({
      titre: f.titre, annee: f.annee, duree: f.duree, budget: f.budget || '',
      lieu: f.lieu || '', domaineId: f.domaine?.id || '', formateurId: f.formateur?.id || '',
      participantIds: f.participants?.map(p => p.id) || []
    });
    setError(''); setModal(true);
  };

  const save = async () => {
    setError('');
    try {
      const payload = {
        ...form,
        domaineId: form.domaineId ? Number(form.domaineId) : null,
        formateurId: form.formateurId ? Number(form.formateurId) : null,
        participantIds: form.participantIds.map(Number),
      };
      if (editing) await api.put(`/formations/${editing.id}`, payload);
      else await api.post('/formations', payload);
      setModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    await api.delete(`/formations/${id}`);
    load();
  };

  const toggleParticipant = (id) => {
    setForm(f => ({
      ...f,
      participantIds: f.participantIds.includes(id)
        ? f.participantIds.filter(p => p !== id)
        : [...f.participantIds, id]
    }));
  };

  return (
    <div>
      <div className="flex-between mb-24">
        <div className="flex gap-8">
          <input
            type="number" placeholder="Filtrer par année" style={{ width: 160 }}
            value={filterAnnee}
            onChange={e => setFilterAnnee(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouvelle formation</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Titre</th><th>Année</th><th>Domaine</th><th>Formateur</th>
                <th>Durée</th><th>Participants</th><th>Lieu</th><th></th>
              </tr>
            </thead>
            <tbody>
              {formations.length === 0 && (
                <tr><td colSpan={8} className="empty"><div className="empty-icon">📋</div>Aucune formation</td></tr>
              )}
              {formations.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 500 }}>{f.titre}</td>
                  <td><span className="pill pill-blue">{f.annee}</span></td>
                  <td>{f.domaine?.libelle}</td>
                  <td>{f.formateur ? `${f.formateur.prenom} ${f.formateur.nom}` : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td>{f.duree}j</td>
                  <td>
                    <span className="pill pill-green">{f.participants?.length || 0}</span>
                  </td>
                  <td>{f.lieu || '—'}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(f)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(f.id)}>Supprimer</button>
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
            <h2>{editing ? 'Modifier la formation' : 'Nouvelle formation'}</h2>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-grid">
              <div className="form-group full">
                <label>Titre *</label>
                <input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Titre de la formation" />
              </div>
              <div className="form-group">
                <label>Année *</label>
                <input type="number" value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Durée (jours)</label>
                <input type="number" min="1" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Budget (DT)</label>
                <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Lieu</label>
                <input value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Domaine *</label>
                <select value={form.domaineId} onChange={e => setForm({ ...form, domaineId: e.target.value })}>
                  <option value="">-- Sélectionner --</option>
                  {domaines.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Formateur</label>
                <select value={form.formateurId} onChange={e => setForm({ ...form, formateurId: e.target.value })}>
                  <option value="">-- Aucun --</option>
                  {formateurs.map(f => <option key={f.id} value={f.id}>{f.prenom} {f.nom}</option>)}
                </select>
              </div>

              <div className="form-group full">
                <label>Participants ({form.participantIds.length} sélectionnés)</label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 6, maxHeight: 180, overflowY: 'auto', padding: 8 }}>
                  {participants.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal', fontSize: 13 }}>
                      <input type="checkbox" checked={form.participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />
                      {p.prenom} {p.nom} — {p.structure?.libelle}
                    </label>
                  ))}
                  {participants.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 12 }}>Aucun participant disponible</div>}
                </div>
                {form.participantIds.length > 0 && form.participantIds.length < 4 && (
                  <div className="field-error">Une formation doit avoir au moins 4 participants.</div>
                )}
              </div>
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
