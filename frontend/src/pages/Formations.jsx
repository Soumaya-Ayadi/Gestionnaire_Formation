import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';
import { VALIDATORS, runValidation, useToast } from '../services/validation.jsx';
import PropTypes from 'prop-types';

const EMPTY_FORM = {
  titre: '', annee: new Date().getFullYear(), dateDebut: '', dateFin: '',
  budget: '', lieu: '', domaineId: '', formateurId: '', participantIds: []
};

const RULES = {
  titre:    [VALIDATORS.required, VALIDATORS.minLen(3)],
  annee:    [VALIDATORS.required, VALIDATORS.positiveNum],
  dateDebut:[VALIDATORS.required],
  dateFin:  [VALIDATORS.required],
  domaineId:[VALIDATORS.selectRequired],
};

function Field({ label, error, children, required, className = '' }) {
  return (
    <div className={`form-group ${className}`}>
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
  className: PropTypes.string,
};

const STATE_CONFIG = {
  'À venir':  { cls: 'pill-blue',   emoji: '🕐' },
  'En cours': { cls: 'pill-green',  emoji: '▶' },
  'Terminée': { cls: 'pill-gray',   emoji: '✓' },
};

export default function Formations() {
  const toast = useToast();
  const [formations, setFormations]   = useState([]);
  const [domaines, setDomaines]       = useState([]);
  const [formateurs, setFormateurs]   = useState([]);
  const [participants, setParticipants] = useState([]);
  const [modal, setModal]             = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [errors, setErrors]           = useState({});
  const [touched, setTouched]         = useState({});
  const [saving, setSaving]           = useState(false);
  const [filterAnnee, setFilterAnnee] = useState('');
  const [search, setSearch]           = useState('');

  const load = useCallback(async () => {
    const url = filterAnnee ? `/formations?annee=${filterAnnee}` : '/formations';
    const [f, d, fo, p] = await Promise.all([
      api.get(url), api.get('/domaines'), api.get('/formateurs'), api.get('/participants')
    ]);
    setFormations(f.data); setDomaines(d.data); setFormateurs(fo.data); setParticipants(p.data);
  }, [filterAnnee]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setTouched({}); setModal(true); };
  const openEdit = (f) => {
    setEditing(f);
    setForm({
      titre: f.titre, annee: f.annee, dateDebut: f.dateDebut, dateFin: f.dateFin,
      budget: f.budget || '', lieu: f.lieu || '', domaineId: f.domaine?.id || '',
      formateurId: f.formateur?.id || '', participantIds: f.participants?.map(p => p.id) || []
    });
    setErrors({}); setTouched({}); setModal(true);
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
    const errs = { ...runValidation(form, RULES) };
    // Date range check
    if (form.dateDebut && form.dateFin && new Date(form.dateFin) < new Date(form.dateDebut)) {
      errs.dateFin = 'La date de fin doit être après la date de début';
    }
    if (form.participantIds.length > 0 && form.participantIds.length < 4) {
      errs.participants = 'Une formation doit avoir au moins 4 participants';
    }
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        domaineId: form.domaineId ? Number(form.domaineId) : null,
        formateurId: form.formateurId ? Number(form.formateurId) : null,
        participantIds: form.participantIds.map(Number),
      };
      if (editing) await api.put(`/formations/${editing.id}`, payload);
      else await api.post('/formations', payload);
      setModal(false); load();
      toast.success(editing ? 'Formation modifiée' : 'Formation créée', form.titre);
    } catch (e) {
      toast.error('Erreur', e.response?.data?.error || 'Une erreur est survenue.');
    } finally { setSaving(false); }
  };

  const del = async (f) => {
    if (!window.confirm(`Supprimer "${f.titre}" ?`)) return;
    try { await api.delete(`/formations/${f.id}`); load(); toast.success('Formation supprimée'); }
    catch { toast.error('Erreur', 'Impossible de supprimer cette formation.'); }
  };

  const toggleParticipant = (id) => {
    setForm(f => ({
      ...f,
      participantIds: f.participantIds.includes(id)
        ? f.participantIds.filter(p => p !== id)
        : [...f.participantIds, id]
    }));
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getState = (start, end) => {
    if (!start || !end) return 'À venir';
    const today = new Date();
    if (today < new Date(start)) return 'À venir';
    if (today > new Date(end)) return 'Terminée';
    return 'En cours';
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

  const inputCls = (key) => errors[key] ? 'input-error' : (touched[key] && form[key] ? 'input-valid' : '');

  const filtered = formations.filter(f =>
    !search || f.titre.toLowerCase().includes(search.toLowerCase()) ||
    f.domaine?.libelle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between mb-24">
        <div className="flex gap-10">
          <input
            placeholder="🔍  Rechercher…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 220, fontSize: 13 }}
          />
          <input
            type="number" placeholder="Année…" style={{ width: 120, fontSize: 13 }}
            value={filterAnnee} onChange={e => setFilterAnnee(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouvelle formation</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Titre</th><th>Année</th><th>État</th><th>Domaine</th><th>Formateur</th><th>Période</th><th>Durée</th><th>Participants</th><th>Lieu</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10}>
                  <div className="empty">
                    <div className="empty-icon">📋</div>
                    <div className="empty-text">{search || filterAnnee ? 'Aucun résultat' : 'Aucune formation'}</div>
                    <div className="empty-sub">{!search && !filterAnnee ? 'Cliquez sur « Nouvelle formation » pour commencer.' : 'Essayez d\'autres critères.'}</div>
                  </div>
                </td></tr>
              )}
              {filtered.map(f => {
                const duration = calculateDuration(f.dateDebut, f.dateFin);
                const state = getState(f.dateDebut, f.dateFin);
                const cfg = STATE_CONFIG[state];
                return (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.titre}>
                        {f.titre}
                      </div>
                    </td>
                    <td><span className="pill pill-blue">{f.annee}</span></td>
                    <td><span className={`pill ${cfg.cls}`}>{cfg.emoji} {state}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{f.domaine?.libelle}</td>
                    <td style={{ fontSize: 13 }}>
                      {f.formateur ? `${f.formateur.prenom} ${f.formateur.nom}` : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>
                      {fmt(f.dateDebut)} → {fmt(f.dateFin)}
                    </td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{duration}j</td>
                    <td><span className="pill pill-green">{f.participants?.length || 0}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{f.lieu || '—'}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(f)}>Modifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(f)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ width: 620 }}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Modifier la formation' : '+ Nouvelle formation'}</h2>
              <p>Les champs marqués <span style={{ color: 'var(--danger)' }}>*</span> sont obligatoires.</p>
            </div>

            <div className="form-grid">
              <Field label="Titre" error={errors.titre} required className="full">
                <input value={form.titre} onChange={set('titre')} onBlur={blur('titre')} className={inputCls('titre')} placeholder="Ex: Formation Sécurité Incendie 2025" />
              </Field>
              <Field label="Année" error={errors.annee} required>
                <input type="number" value={form.annee} onChange={set('annee')} onBlur={blur('annee')} className={inputCls('annee')} />
              </Field>
              <Field label="Lieu">
                <input value={form.lieu} onChange={set('lieu')} placeholder="Tunis, Sfax…" />
              </Field>
              <Field label="Date de début" error={errors.dateDebut} required>
                <input type="date" value={form.dateDebut} onChange={set('dateDebut')} onBlur={blur('dateDebut')} className={inputCls('dateDebut')} />
              </Field>
              <Field label="Date de fin" error={errors.dateFin} required>
                <input type="date" value={form.dateFin} onChange={set('dateFin')} onBlur={blur('dateFin')} className={inputCls('dateFin')} />
              </Field>
              <Field label="Budget (DT)" error={errors.budget}>
                <input type="number" value={form.budget} onChange={set('budget')} onBlur={blur('budget')} placeholder="0" min="0" className={inputCls('budget')} />
              </Field>
              <Field label="Domaine" error={errors.domaineId} required>
                <select value={form.domaineId} onChange={set('domaineId')} onBlur={blur('domaineId')} className={errors.domaineId ? 'input-error' : ''}>
                  <option value="">— Sélectionner —</option>
                  {domaines.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                </select>
              </Field>
              <Field label="Formateur">
                <select value={form.formateurId} onChange={set('formateurId')}>
                  <option value="">— Aucun —</option>
                  {formateurs.map(f => <option key={f.id} value={f.id}>{f.prenom} {f.nom}</option>)}
                </select>
              </Field>

              <div className="form-group full">
                <label>
                  Participants
                  {form.participantIds.length > 0 && (
                    <span className="selection-count-badge">{form.participantIds.length} sélectionné{form.participantIds.length !== 1 ? 's' : ''}</span>
                  )}
                </label>
                <div className="participant-checklist">
                  {participants.map(p => (
                    <label key={p.id} className="participant-item">
                      <input type="checkbox" checked={form.participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />
                      <span style={{ flex: 1 }}>{p.prenom} {p.nom}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>{p.structure?.libelle}</span>
                    </label>
                  ))}
                  {participants.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 12, padding: 8 }}>Aucun participant disponible</div>}
                </div>
                {errors.participants && <span className="field-error">⚠ {errors.participants}</span>}
                {form.participantIds.length > 0 && form.participantIds.length < 4 && !errors.participants && (
                  <span className="field-error">⚠ Minimum 4 participants requis ({4 - form.participantIds.length} manquant{4 - form.participantIds.length !== 1 ? 's' : ''})</span>
                )}
              </div>
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
    </div>
  );
}