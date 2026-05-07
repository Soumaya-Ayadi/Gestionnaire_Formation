import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.jsx';
import { useToast } from '../services/validation.jsx';
import { usePagination, Pagination } from '../services/usePagination.jsx';
import Swal from 'sweetalert2';   

/* eslint-disable react/prop-types */
function SimpleTable({ title, endpoint, fields, icon }) {
  const toast = useToast();
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({});
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const PAGE_SIZE = 5; // Set page size to 5 items per page

  // Apply search filter
  const filtered = items.filter(item => {
    if (!search) return true;
    // Search in all text fields
    return fields.some(field => {
      const value = item[field.key];
      if (value && typeof value === 'string') {
        return value.toLowerCase().includes(search.toLowerCase());
      }
      return false;
    });
  });

  const { page, setPage, totalPages, paginated, showAll, setShowAll, reset } =
    usePagination(filtered, PAGE_SIZE);

  const load = useCallback(async () => {
    const { data } = await api.get(endpoint);
    setItems(data);
    reset();
  }, [endpoint, reset]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { reset(); }, [search]);

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

  const del = async (id, label = '') => {
    const result = await Swal.fire({
      title: 'Supprimer cet élément ?',
      html: `<span style="color:#6b6f7e;font-size:14px">${label ? `<b>${label}</b> sera` : 'Cet élément sera'} définitivement supprimé.</span>`,
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
      await api.delete(`${endpoint}/${id}`);
      load();
      toast.success('Élément supprimé');
    } catch {
      toast.error('Erreur', 'Impossible de supprimer cet élément.');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearch('');
  };

  return (
    <div className="card mb-24">
      <div className="card-header">
        <h3>
          <span className="card-icon" style={{ background: 'var(--bg)', fontSize: 14 }}>{icon}</span>
          {title}
          <span style={{ background: 'var(--bg)', color: 'var(--muted)', borderRadius: 20, fontSize: 11, padding: '1px 8px', fontWeight: 500 }}>
            {filtered.length}
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            placeholder="🔍 Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: 200, 
              fontSize: 13, 
              padding: '6px 12px', 
              borderRadius: 'var(--radius)', 
              border: '1px solid var(--border)',
              background: 'white'
            }}
          />
          {search && (
            <button 
              onClick={clearSearch}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 12px' }}
            >
              ✕
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Ajouter</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {fields.map(f => <th key={f.key}>{f.label}</th>)}
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={fields.length + 1}>
                  <div className="empty" style={{ padding: '28px 20px' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {search ? 'Aucun résultat trouvé' : 'Aucun enregistrement'}
                    </div>
                    {search && (
                      <button 
                        onClick={clearSearch}
                        style={{ marginTop: 12 }}
                        className="btn btn-ghost btn-sm"
                      >
                        ✕ Effacer la recherche
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {paginated.map(item => (
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
                    <button className="btn btn-danger btn-sm" onClick={() => del(item.id, item.libelle || item.nomEmployeur)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page} 
        setPage={setPage}
        totalPages={totalPages} 
        total={filtered.length}
        pageSize={PAGE_SIZE} 
        showAll={showAll} 
        setShowAll={setShowAll}
      />

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ width: 420 }}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Modifier' : '+ Ajouter'} — {title}</h2>
              <p>Renseignez les informations ci-dessous.</p>
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
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