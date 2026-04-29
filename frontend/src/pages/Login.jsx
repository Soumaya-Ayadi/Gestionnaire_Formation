import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = () => {
    if (!form.login.trim()) return 'Veuillez saisir votre identifiant.';
    if (form.login.trim().length < 3) return 'L\'identifiant doit contenir au moins 3 caractères.';
    if (!form.password) return 'Veuillez saisir votre mot de passe.';
    if (form.password.length < 4) return 'Mot de passe trop court.';
    return '';
  };

  const handle = async (e) => {
    e.preventDefault();
    setTouched({ login: true, password: true });
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await signIn(form.login, form.password);
      navigate('/');
    } catch {
      setError('Identifiant ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const loginError = touched.login && !form.login.trim() ? 'Champ requis' : '';
  const passError = touched.password && !form.password ? 'Champ requis' : '';

  return (
    <div className="login-page">
      {/* Visual side */}
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="login-visual-logo">🌿</div>
          <h1>Gestion de<br />Formation</h1>
          <p>Plateforme centralisée pour piloter vos formations, formateurs et participants.</p>
          <div className="login-dots">
            <span/><span/><span/><span/>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <div className="login-box">
          <div className="login-box-header">
            <h2>Bienvenue </h2>
            <p>Connectez-vous pour accéder à votre espace</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handle} noValidate>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Identifiant</label>
              <input
                type="text"
                placeholder="Votre identifiant"
                value={form.login}
                className={loginError ? 'input-error' : form.login ? 'input-valid' : ''}
                onChange={e => setForm({ ...form, login: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, login: true }))}
                autoComplete="username"
              />
              {loginError && <span className="field-error">⚠ {loginError}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                className={passError ? 'input-error' : ''}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                autoComplete="current-password"
              />
              {passError && <span className="field-error">⚠ {passError}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  Connexion…
                </>
              ) : 'Se connecter →'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 11.5, color: 'var(--muted)', textAlign: 'center' }}>
            Excellent Training · Centre de Formation
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}