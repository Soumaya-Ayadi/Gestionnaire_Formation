import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';
import { VALIDATORS, runValidation, useToast } from '../services/validation.jsx';
import PropTypes from 'prop-types';

const EMPTY = { nom: '', prenom: '', email: '', tel: '', structureId: '', profilId: '' };

const RULES = {
  nom:         [VALIDATORS.required, VALIDATORS.minLen(2)],
  prenom:      [VALIDATORS.required, VALIDATORS.minLen(2)],
  email:       [VALIDATORS.email],
  tel:         [VALIDATORS.phone],
  structureId: [VALIDATORS.selectRequired],
  profilId:    [VALIDATORS.selectRequired],
};

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label>{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="field-error">⚠ {error}</span>}
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  required: PropTypes.bool,
};

export default function Participants() {
  const toast = useToast();
  const [participants, setParticipants] = useState([]);
  const [structures, setStructures]     = useState([]);
  const [profils, setProfils]           = useState([]);
  const [modal, setModal]               = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(EMPTY);
  const [errors, setErrors]             = useState({});
  const [touched, setTouched]           = useState({});
  const [saving, setSaving]             = useState(false);
  const [historyModal, setHistoryModal] = useState(null);
  const [history, setHistory]           = useState([]);
  const [search, setSearch]             = useState('');

  const load = useCallback(async () => {
    const [p, s, pr] = await Promise.all([api.get('/participants'), api.get('/structures'), api.get('/profils')]);
    setParticipants(p.data); setStructures(s.data); setProfils(pr.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setTouched({}); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ nom: p.nom, prenom: p.prenom, email: p.email || '', tel: p.tel || '', structureId: p.structure?.id || '', profilId: p.profil?.id || '' });
    setErrors({}); setTouched({}); setModal(true);
  };
  const openHistory = async (p) => {
    const { data } = await api.get(`/participants/${p.id}/formations`);
    setHistory(data); setHistoryModal(p);
  };

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [key]: val }));
    if (touched[key] && RULES[key]) {
      setErrors(err => ({ ...err, [key]: runValidation({ [key]: val }, { [key]: RULES[key] })[key] || '' }));
    }
  };
  const blur = (key) => () => {
    setTouched(t => ({ ...t, [key]: true }));
    if (RULES[key]) setErrors(e => ({ ...e, [key]: runValidation(form, { [key]: RULES[key] })[key] || '' }));
  };

  const save = async () => {
    setTouched(Object.fromEntries(Object.keys(RULES).map(k => [k, true])));
    const errs = runValidation(form, RULES);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setSaving(true);
    try {
      const payload = { ...form, structureId: Number(form.structureId), profilId: Number(form.profilId) };
      if (editing) await api.put(`/participants/${editing.id}`, payload);
      else await api.post('/participants', payload);
      setModal(false); load();
      toast.success(editing ? 'Participant modifié' : 'Participant ajouté', `${form.prenom} ${form.nom}`);
    } catch (e) {
      toast.error('Erreur', e.response?.data?.error || 'Une erreur est survenue.');
    } finally { setSaving(false); }
  };

  const del = async (p) => {
    if (!window.confirm(`Supprimer ${p.prenom} ${p.nom} ?`)) return;
    try { await api.delete(`/participants/${p.id}`); load(); toast.success('Participant supprimé'); }
    catch { toast.error('Erreur', 'Impossible de supprimer ce participant.'); }
  };

  const inputCls = (key) => errors[key] ? 'input-error' : (touched[key] && form[key] ? 'input-valid' : '');

  const filtered = participants.filter(p =>
    !search || `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between mb-24">
        <div className="flex gap-10">
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>
            <strong style={{ color: 'var(--text)' }}>{participants.length}</strong> participant{participants.length !== 1 ? 's' : ''}
          </span>
          <input
            placeholder="🔍  Rechercher…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 220, fontSize: 13 }}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouveau participant</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Structure</th><th>Profil</th><th>Formations</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty">
                    <div className="empty-icon">👥</div>
                    <div className="empty-text">{search ? 'Aucun résultat' : 'Aucun participant'}</div>
                    <div className="empty-sub">{search ? 'Essayez un autre terme de recherche.' : 'Cliquez sur « Nouveau participant » pour commencer.'}</div>
                  </div>
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.nom}</td>
                  <td>{p.prenom}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{p.email || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>{p.tel || '—'}</td>
                  <td><span className="pill pill-gray">{p.structure?.libelle}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{p.profil?.libelle}</td>
                  <td>
                    <span className="pill pill-blue">{p.formationIds?.length || 0}</span>
                  </td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => openHistory(p)}>Historique</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p)}>Supprimer</button>
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
            <div className="modal-header">
              <h2>{editing ? '✏️ Modifier le participant' : '+ Nouveau participant'}</h2>
              <p>Les champs marqués <span style={{ color: 'var(--danger)' }}>*</span> sont obligatoires.</p>
            </div>
            <div className="form-grid">
              <Field label="Nom" error={errors.nom} required>
                <input value={form.nom} onChange={set('nom')} onBlur={blur('nom')} className={inputCls('nom')} placeholder="Dupont" />
              </Field>
              <Field label="Prénom" error={errors.prenom} required>
                <input value={form.prenom} onChange={set('prenom')} onBlur={blur('prenom')} className={inputCls('prenom')} placeholder="Marie" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={set('email')} onBlur={blur('email')} className={inputCls('email')} placeholder="marie.dupont@exemple.com" />
              </Field>
              <Field label="Téléphone" error={errors.tel}>
                <input value={form.tel} onChange={set('tel')} onBlur={blur('tel')} className={inputCls('tel')} placeholder="22 345 678" />
              </Field>
              <Field label="Structure" error={errors.structureId} required>
                <select value={form.structureId} onChange={set('structureId')} onBlur={blur('structureId')} className={errors.structureId ? 'input-error' : ''}>
                  <option value="">— Sélectionner —</option>
                  {structures.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                </select>
              </Field>
              <Field label="Profil" error={errors.profilId} required>
                <select value={form.profilId} onChange={set('profilId')} onBlur={blur('profilId')} className={errors.profilId ? 'input-error' : ''}>
                  <option value="">— Sélectionner —</option>
                  {profils.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                </select>
              </Field>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {historyModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setHistoryModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>📋 Formations de {historyModal.prenom} {historyModal.nom}</h2>
              <p>{history.length} formation{history.length !== 1 ? 's' : ''} suivie{history.length !== 1 ? 's' : ''}</p>
            </div>
            {history.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📋</div>
                <div className="empty-text">Aucune formation suivie</div>
              </div>
            ) : (
              <table>
                <thead><tr><th>Titre</th><th>Année</th><th>Domaine</th><th>Durée</th></tr></thead>
                <tbody>
                  {history.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 500 }}>{f.titre}</td>
                      <td><span className="pill pill-blue">{f.annee}</span></td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{f.domaine?.libelle}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{f.duree}j</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setHistoryModal(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}