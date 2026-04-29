import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';
import { VALIDATORS, runValidation, useToast } from '../services/validation.jsx';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const EMPTY = { nom: '', prenom: '', email: '', tel: '', type: 'INTERNE', employeurId: '' };

const RULES = {
  nom:      [VALIDATORS.required, VALIDATORS.minLen(2)],
  prenom:   [VALIDATORS.required, VALIDATORS.minLen(2)],
  email:    [VALIDATORS.email],
  tel:      [VALIDATORS.phone],
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

export default function Formateurs() {
  const toast = useToast();
  const [formateurs, setFormateurs] = useState([]);
  const [employeurs, setEmployeurs] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [fo, em] = await Promise.all([api.get('/formateurs'), api.get('/employeurs')]);
    setFormateurs(fo.data); setEmployeurs(em.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setTouched({}); setModal(true); window.scrollTo(0, 0); };
  const openEdit = (fo) => {
    setEditing(fo);
    setForm({ nom: fo.nom, prenom: fo.prenom, email: fo.email, tel: fo.tel || '', type: fo.type, employeurId: fo.employeur?.id || '' });
    setErrors({}); setTouched({}); setModal(true); window.scrollTo(0, 0);
  };

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [key]: val }));
    if (touched[key]) {
      const rules = { [key]: RULES[key] || [] };
      if (RULES[key]) setErrors(err => ({ ...err, [key]: runValidation({ [key]: val }, rules)[key] || '' }));
    }
  };

  const blur = (key) => () => {
    setTouched(t => ({ ...t, [key]: true }));
    if (RULES[key]) {
      const errs = runValidation(form, { [key]: RULES[key] });
      setErrors(e => ({ ...e, [key]: errs[key] || '' }));
    }
  };

  const save = async () => {
    setTouched(Object.fromEntries(Object.keys(RULES).map(k => [k, true])));
    let allRules = { ...RULES };
    if (form.type === 'EXTERNE') allRules.employeurId = [VALIDATORS.selectRequired];
    const errs = runValidation(form, allRules);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSaving(true);
    try {
      const payload = { ...form, employeurId: form.employeurId ? Number(form.employeurId) : null };
      if (editing) await api.put(`/formateurs/${editing.id}`, payload);
      else await api.post('/formateurs', payload);
      setModal(false);
      load();
      toast.success(editing ? 'Formateur modifié' : 'Formateur créé', `${form.prenom} ${form.nom} a été ${editing ? 'mis à jour' : 'ajouté'}.`);
    } catch (e) {
      toast.error('Erreur', e.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (fo) => {
    const result = await Swal.fire({
      title: 'Supprimer le formateur ?',
      html: `<span style="color:#6b6f7e;font-size:14px"><b>${fo.prenom} ${fo.nom}</b> sera définitivement supprimé.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#e04444',
      cancelButtonColor: '#6b6f7e',
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/formateurs/${fo.id}`);
      load();
      toast.success('Formateur supprimé', `${fo.prenom} ${fo.nom}`);
    } catch {
      toast.error('Erreur', 'Impossible de supprimer ce formateur.');
    }
  };

  const inputCls = (key) => errors[key] ? 'input-error' : (touched[key] && form[key] ? 'input-valid' : '');

  return (
    <div>
      <div className="flex-between mb-24">
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>
          <strong style={{ color: 'var(--text)' }}>{formateurs.length}</strong> formateur{formateurs.length !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouveau formateur</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Type</th><th>Employeur</th><th></th></tr>
            </thead>
            <tbody>
              {formateurs.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty">
                    <div className="empty-icon">🎓</div>
                    <div className="empty-text">Aucun formateur enregistré</div>
                    <div className="empty-sub">Cliquez sur « Nouveau formateur » pour commencer.</div>
                  </div>
                </td></tr>
              )}
              {formateurs.map(fo => (
                <tr key={fo.id}>
                  <td style={{ fontWeight: 600 }}>{fo.nom}</td>
                  <td>{fo.prenom}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{fo.email}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>{fo.tel || '—'}</td>
                  <td>
                    <span className={`pill ${fo.type === 'INTERNE' ? 'pill-green' : 'pill-orange'}`}>
                      {fo.type === 'INTERNE' ? '🏢 Interne' : '🔗 Externe'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{fo.employeur?.nomEmployeur || '—'}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(fo)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(fo)}>Supprimer</button>
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
            <div className="modal-header">
              <h2>{editing ? '✏️ Modifier le formateur' : '+ Nouveau formateur'}</h2>
              <p>Renseignez les informations du formateur ci-dessous.</p>
            </div>

            <div className="form-grid">
              <Field label="Nom" error={errors.nom} required>
                <input value={form.nom} onChange={set('nom')} onBlur={blur('nom')} className={inputCls('nom')} placeholder="Dupont" />
              </Field>
              <Field label="Prénom" error={errors.prenom} required>
                <input value={form.prenom} onChange={set('prenom')} onBlur={blur('prenom')} className={inputCls('prenom')} placeholder="Jean" />
              </Field>
              <Field label="Email" error={errors.email} required>
                <input type="email" value={form.email} onChange={set('email')} onBlur={blur('email')} className={inputCls('email')} placeholder="jean.dupont@exemple.com" />
              </Field>
              <Field label="Téléphone" error={errors.tel}>
                <input value={form.tel} onChange={set('tel')} onBlur={blur('tel')} className={inputCls('tel')} placeholder="22 345 678" />
              </Field>
              <Field label="Type" required>
                <select value={form.type} onChange={set('type')}>
                  <option value="INTERNE">🏢 Interne</option>
                  <option value="EXTERNE">🔗 Externe</option>
                </select>
              </Field>
              {form.type === 'EXTERNE' && (
                <Field label="Employeur" error={errors.employeurId} required>
                  <select value={form.employeurId} onChange={set('employeurId')} onBlur={blur('employeurId')} className={errors.employeurId ? 'input-error' : ''}>
                    <option value="">— Sélectionner —</option>
                    {employeurs.map(e => <option key={e.id} value={e.id}>{e.nomEmployeur}</option>)}
                  </select>
                </Field>
              )}
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