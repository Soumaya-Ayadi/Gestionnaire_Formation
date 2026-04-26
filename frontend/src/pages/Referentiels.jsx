import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';
import { useToast } from '../services/validation.jsx';

/* eslint-disable react/prop-types */
function SimpleTable({ title, endpoint, fields, icon }) {
  const toast = useToast();
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({});
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});

  const load = useCallback(async () => {
    const { data } = await api.get(endpoint);
    setItems(data);
  }, [endpoint]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(Object.fromEntries(fields.map(f => [f.key, ''])));
    setErrors({});
    setModal(true);
    window.scrollTo(0, 0);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] || ''])));
    setErrors({});
    setModal(true);
    window.scrollTo(0, 0);
  };

  const validate = () => {
    const errs = {};
    fields.forEach(f => {
      if (f.required && !form[f.key]?.trim()) errs[f.key] = 'Ce champ est requis';
    });
    return errs;
  };

  const save = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    try {
      if (editing) await api.put(`${endpoint}/${editing.id}`, form);
      else await api.post(endpoint, form);
      setModal(false); load();
      toast.success(editing ? 'Élément modifié' : 'Élément ajouté');
    } catch { toast.error('Erreur', 'Une erreur est survenue.'); }
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    try { await api.delete(`${endpoint}/${id}`); load(); toast.success('Élément supprimé'); }
    catch { toast.error('Erreur', 'Impossible de supprimer cet élément.'); }
  };

  return (
    <div className="card mb-24">
      <div className="card-header">
        <h3>
          <span className="card-icon" style={{ background: 'var(--bg)', fontSize: 14 }}>{icon}</span>
          {title}
          <span style={{ background: 'var(--bg)', color: 'var(--muted)', borderRadius: 20, fontSize: 11, padding: '1px 8px', fontWeight: 500 }}>
            {items.length}
          </span>
        </h3>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Ajouter</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {fields.map(f => <th key={f.key}>{f.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={fields.length + 1}>
                <div className="empty" style={{ padding: '28px 20px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Aucun enregistrement</div>
                </div>
              </td></tr>
            )}
            {items.map(item => (
              <tr key={item.id}>
                {fields.map(f => (
                  <td key={f.key}>
                    {f.options ? (
                      <span className={`pill ${item[f.key] === 'CENTRALE' ? 'pill-blue' : 'pill-green'}`}>
                        {item[f.key]}
                      </span>
                    ) : (
                      item[f.key]
                    )}
                  </td>
                ))}
                <td>
                  <div className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(item.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ width: 420 }}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Modifier' : '+ Ajouter'} — {title}</h2>
            </div>
            {fields.map(f => (
              <div className="form-group" style={{ marginBottom: 16 }} key={f.key}>
                <label>{f.label}{f.required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
                {f.options
                  ? <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className={errors[f.key] ? 'input-error' : ''}>
                      <option value="">— Sélectionner —</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  : <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className={errors[f.key] ? 'input-error' : ''} />
                }
                {errors[f.key] && <span className="field-error">⚠ {errors[f.key]}</span>}
              </div>
            ))}
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

export default function Referentiels() {
  return (
    <div>
      <SimpleTable icon="🎯" title="Domaines" endpoint="/domaines"
        fields={[{ key: 'libelle', label: 'Libellé', required: true }]} />
      <SimpleTable icon="👤" title="Profils" endpoint="/profils"
        fields={[{ key: 'libelle', label: 'Libellé', required: true }]} />
      <SimpleTable icon="🏢" title="Structures" endpoint="/structures" fields={[
        { key: 'libelle', label: 'Libellé', required: true },
        { key: 'type', label: 'Type', options: ['CENTRALE', 'REGIONALE'] },
      ]} />
      <SimpleTable icon="🔗" title="Employeurs" endpoint="/employeurs"
        fields={[{ key: 'nomEmployeur', label: "Nom de l'employeur", required: true }]} />
    </div>
  );
}