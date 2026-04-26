// ─── Validation helpers ───────────────────────────────────────────────────────

import PropTypes from 'prop-types';

export const VALIDATORS = {
  required: (v) => (!v || !String(v).trim()) ? 'Ce champ est requis' : '',
  email: (v) => {
    if (!v) return 'Email requis';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Format email invalide (ex: nom@domaine.com)';
  },
  phone: (v) => {
    if (!v) return '';
    return /^[0-9\s+\-().]{8,15}$/.test(v) ? '' : 'Numéro invalide (8–15 chiffres)';
  },
  minLen: (n) => (v) => (v && v.length >= n) ? '' : `Minimum ${n} caractères`,
  positiveNum: (v) => {
    if (!v && v !== 0) return '';
    return !isNaN(v) && Number(v) >= 0 ? '' : 'Valeur numérique positive requise';
  },
  selectRequired: (v) => (!v || v === '') ? 'Veuillez sélectionner une option' : '',
  dateRange: (start, end) => {
    if (!start || !end) return '';
    return new Date(end) >= new Date(start) ? '' : 'La date de fin doit être après la date de début';
  },
};

export function runValidation(form, rules) {
  const errs = {};
  for (const [field, fns] of Object.entries(rules)) {
    for (const fn of fns) {
      const msg = fn(form[field]);
      if (msg) { errs[field] = msg; break; }
    }
  }
  return errs;
}

// ─── Toast system ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, title, msg) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, type, title, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
            <button className="toast-close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const push = useContext(ToastCtx);
  return {
    success: (title, msg) => push('success', title, msg),
    error: (title, msg) => push('error', title, msg),
    info: (title, msg) => push('info', title, msg),
  };
}