import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { translateAuthError } from '../../utils/authErrors';
import { useScrollBottomCap } from '../../utils/useScrollBottomCap';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

export default function LoginModal({ open, onClose }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bodyRef] = useScrollBottomCap([open, mode, error]);
  useBodyScrollLock(open);

  function resetForm() {
    setEmail('');
    setPassword('');
    setMode('signin');
    setError('');
    setSubmitting(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Sukses: onAuthStateChanged di dashboard bakal otomatis kedeteksi
      // dan langsung nge-load/nyimpen data trading khusus akun ini.
      resetForm();
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(translateAuthError(err));
    }
  }

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <div className="modal-head-top">
            <h2>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
            <button className="btn modal-close" onClick={handleClose} aria-label="Tutup">✕</button>
          </div>
          <div className="modal-sub">
            {mode === 'signin'
              ? 'Masuk ke akunmu untuk mengaktifkan auto sync data trading.'
              : 'Buat akun untuk simpan progress dan buka fitur premium nanti.'}
          </div>
        </div>
        <div className="modal-body" ref={bodyRef}>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="field-hint" style={{ color: 'var(--loss)', opacity: 1, marginBottom: '10px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-accent submit-btn" disabled={submitting}>
              {submitting
                ? 'Memproses...'
                : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="login-switch">
            {mode === 'signin' ? (
              <>Belum punya akun? <button type="button" onClick={() => switchMode('signup')}>Sign up</button></>
            ) : (
              <>Sudah punya akun? <button type="button" onClick={() => switchMode('signin')}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
