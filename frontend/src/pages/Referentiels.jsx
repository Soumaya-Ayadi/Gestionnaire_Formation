import  { useEffect, useState } from 'react';
import api from '../services/api.jsx';
/* eslint-disable react/prop-types */
function SimpleTable({ title, endpoint, fields }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await api.get(endpoint);
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(Object.fromEntries(fields.map(f => [f.key, ''])));
    setModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] || ''])));
    setModal(true);
  };

  const save = async () => {
    if (editing) await api.put(`${endpoint}/${editing.id}`, form);
    else await api.post(endpoint, form);
    setModal(false); load();
  };

  const del = async (id) => {
    if (!window.confirm(`Supprimer cet élément ?`)) return;
    await api.delete(`${endpoint}/${id}`); load();
  };

  return (
    <div className="card mb-24">
      <div className="card-header">
        <h3>{title} ({items.length})</h3>
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
              <tr><td colSpan={fields.length + 1} className="empty">Aucun enregistrement</td></tr>
            )}
            {items.map(item => (
              <tr key={item.id}>
                {fields.map(f => <td key={f.key}>{item[f.key]}</td>)}
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
          <div className="modal" style={{ width: 400 }}>
            <h2>{editing ? 'Modifier' : 'Ajouter'} — {title}</h2>
            {fields.map(f => (
              <div className="form-group mb-16" key={f.key}>
                <label>{f.label}</label>
                {f.options
                  ? <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      <option value="">-- Sélectionner --</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  : <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                }
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
      <SimpleTable title="Domaines" endpoint="/domaines" fields={[{ key: 'libelle', label: 'Libellé' }]} />
      <SimpleTable title="Profils" endpoint="/profils" fields={[{ key: 'libelle', label: 'Libellé' }]} />
      <SimpleTable title="Structures" endpoint="/structures" fields={[
        { key: 'libelle', label: 'Libellé' },
        { key: 'type', label: 'Type', options: ['CENTRALE', 'REGIONALE'] },
      ]} />
      <SimpleTable title="Employeurs" endpoint="/employeurs" fields={[{ key: 'nomEmployeur', label: 'Nom de l\'employeur' }]} />
    </div>
  );
}
