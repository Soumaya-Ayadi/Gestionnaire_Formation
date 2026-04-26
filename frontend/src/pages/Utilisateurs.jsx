import { useEffect, useState } from 'react';
import api from '../services/api.jsx';
import { useAuth } from '../services/AuthContext.jsx';
import { VALIDATORS, runValidation, useToast } from '../services/validation.jsx';
import PropTypes from 'prop-types';

const EMPTY = { login: '', email: '', role: 'ROLE_USER' };
const RULES = {
  login: [VALIDATORS.required, VALIDATORS.minLen(3)],
  email: [VALIDATORS.email],
};

const ROLE_META = {
  ROLE_ADMIN:       { label: 'Admin',       cls: 'pill-orange', icon: '🔑' },
  ROLE_USER:        { label: 'Utilisateur', cls: 'pill-blue',   icon: '👤' },
  ROLE_RESPONSABLE: { label: 'Responsable', cls: 'pill-green',  icon: '📊' },
};

function Field({ label, error, children, required }) {
  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
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

export default function Utilisateurs() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [users, setUsers]       = useState([]);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [saving, setSaving]     = useState(false);
  const [genPass, setGenPass]   = useState('');

  const load = async () => {
    const { data } = await api.get('/utilisateurs');
    setUsers(data);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setErrors({}); setTouched({}); setGenPass(''); setModal(true); window.scrollTo(0, 0); };

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
    setTouched({ login: true, email: true });
    const errs = runValidation(form, RULES);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setSaving(true);
    try {
      const res = await api.post('/utilisateurs', { login: form.login, email: form.email, role: { nom: form.role } });
      setGenPass(res.data.generatedPassword);
      toast.success('Compte créé !', `Mot de passe temporaire affiché ci-dessous.`);
      load();
    } catch (e) {
      const data = e.response?.data;
      const msg = typeof data === 'object' ? Object.values(data).join(', ') : data?.error || 'Erreur';
      toast.error('Erreur de création', msg);
    } finally { setSaving(false); }
  };

  const del = async (u) => {
    if (!window.confirm(`Supprimer le compte « ${u.login} » ?`)) return;
    try { await api.delete(`/utilisateurs/${u.id}`); load(); toast.success('Compte supprimé'); }
    catch { toast.error('Erreur', 'Impossible de supprimer cet utilisateur.'); }
  };

  const inputCls = (key) => errors[key] ? 'input-error' : (touched[key] && form[key] ? 'input-valid' : '');

  return (
    <div>
      <div className="flex-between mb-24">
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>
          <strong style={{ color: 'var(--text)' }}>{users.length}</strong> utilisateur{users.length !== 1 ? 's' : ''}
        </span>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Créer un compte</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Login</th><th>Email</th><th>Rôle</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty">
                    <div className="empty-icon">🔑</div>
                    <div className="empty-text">Aucun utilisateur</div>
                  </div>
                </td></tr>
              )}
              {users.map(u => {
                const m = ROLE_META[u.role?.nom] || { label: u.role?.nom, cls: 'pill-gray', icon: '?' };
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3d5fdb 0%, #6b48e0 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {u.login?.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.login}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{u.email}</td>
                    <td>
                      <span className={`pill ${m.cls}`}>{m.icon} {m.label}</span>
                    </td>
                    <td>
                      <span className={`status-dot ${u.active ? 'active' : 'inactive'}`} style={{ fontSize: 12, color: u.active ? 'var(--success)' : 'var(--muted)' }}>
                        {u.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      {isAdmin && u.login !== user?.login && (
                        <button className="btn btn-danger btn-sm" onClick={() => del(u)}>Supprimer</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && isAdmin && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && !genPass && setModal(false)}>
          <div className="modal" style={{ width: 440 }}>
            {!genPass ? (
              <>
                <div className="modal-header">
                  <h2>+ Créer un compte utilisateur</h2>
                  <p>Un mot de passe temporaire sera généré automatiquement.</p>
                </div>
                <Field label="Identifiant" error={errors.login} required>
                  <input value={form.login} onChange={set('login')} onBlur={blur('login')}
                    className={inputCls('login')} placeholder="min. 3 caractères" />
                </Field>
                <Field label="Email" error={errors.email} required>
                  <input type="email" value={form.email} onChange={set('email')} onBlur={blur('email')}
                    className={inputCls('email')} placeholder="utilisateur@exemple.com" />
                </Field>
                <Field label="Rôle" required>
                  <select value={form.role} onChange={set('role')}>
                    <option value="ROLE_USER">👤 Utilisateur simple</option>
                    <option value="ROLE_RESPONSABLE">📊 Responsable de centre</option>
                    <option value="ROLE_ADMIN">🔑 Administrateur</option>
                  </select>
                </Field>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
                  <button className="btn btn-primary" onClick={save} disabled={saving}>
                    {saving ? 'Création…' : 'Créer un compte'}
                  </button>
                </div>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>🎉</div>
                <h2 style={{ marginBottom: 8 }}>Compte créé avec succès</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
                  Communiquez ce mot de passe temporaire à l&apos;utilisateur.
                </p>
                <div style={{
                  background: 'var(--bg)', border: '1.5px dashed var(--border)',
                  borderRadius: 8, padding: '16px 20px', marginBottom: 24,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mot de passe temporaire</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 20, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.1em' }}>
                    {genPass}
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setModal(false)}>
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}