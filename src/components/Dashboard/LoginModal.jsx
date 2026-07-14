import { useState } from 'react';

export default function LoginModal({ open, onClose, onLogin }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function resetForm() {
    setEmail('');
    setPassword('');
    setMode('signin');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    onLogin?.({ mode, email, password });
    resetForm();
    onClose();
  }

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <h2>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
          <button className="btn modal-close" onClick={handleClose} aria-label="Tutup">✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-sub">
            {mode === 'signin'
              ? 'Masuk ke akunmu untuk mengaktifkan auto sync data trading.'
              : 'Buat akun untuk simpan progress dan buka fitur premium nanti.'}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
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
                required
              />
            </div>

            <button type="submit" className="btn btn-accent submit-btn">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="login-switch">
            {mode === 'signin' ? (
              <>Belum punya akun? <button type="button" onClick={() => setMode('signup')}>Sign up</button></>
            ) : (
              <>Sudah punya akun? <button type="button" onClick={() => setMode('signin')}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
