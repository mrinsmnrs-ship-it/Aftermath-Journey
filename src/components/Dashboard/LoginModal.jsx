import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../../firebase';
import { translateAuthError } from '../../utils/authErrors';
import { useScrollBottomCap } from '../../utils/useScrollBottomCap';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

export default function LoginModal({ open, onClose }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bodyRef] = useScrollBottomCap([open, mode, error, successMsg]);
  useBodyScrollLock(open);

  function resetForm() {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMode('signin');
    setError('');
    setSuccessMsg('');
    setSubmitting(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function switchMode(next) {
    setMode(next);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Mode reset password: cukup butuh email, nggak perlu ke Firebase Auth sign in/up.
    if (mode === 'reset') {
      setSubmitting(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSubmitting(false);
        setSuccessMsg('Link reset password udah dikirim. Cek inbox (atau folder spam) email kamu.');
      } catch (err) {
        setSubmitting(false);
        setError(translateAuthError(err));
      }
      return;
    }

    // Mode signup: pastikan konfirmasi password cocok sebelum ke Firebase.
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Konfirmasi password nggak cocok.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        // Sukses: onAuthStateChanged di dashboard bakal otomatis kedeteksi
        // dan langsung nge-load/nyimpen data trading khusus akun ini.
        resetForm();
        onClose();
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await sendEmailVerification(cred.user);
        } catch {
          // Kalau kirim email verifikasi gagal (mis. kuota/limit), jangan blok akun
          // yang udah kebentuk. Cukup lewati, user tetap bisa pakai akunnya.
        }
        setSubmitting(false);
        setSuccessMsg('Akun berhasil dibuat! Kami udah kirim link verifikasi ke emailmu.');
        setPassword('');
        setConfirmPassword('');
      }
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
            <h2>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}</h2>
            <button className="btn modal-close" onClick={handleClose} aria-label="Tutup">✕</button>
          </div>
          <div className="modal-sub">
            {mode === 'signin' && 'Masuk ke akunmu untuk mengaktifkan auto sync data trading.'}
            {mode === 'signup' && 'Buat akun untuk simpan progress dan buka fitur premium nanti.'}
            {mode === 'reset' && 'Masukkan email akunmu, kami kirim link buat bikin password baru.'}
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

            {mode !== 'reset' && (
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
                {mode === 'signin' && (
                  <div className="field-hint" style={{ textAlign: 'right', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => switchMode('reset')}
                    >
                      Lupa password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="loginConfirmPassword">Konfirmasi Password</label>
                <input
                  type="password"
                  id="loginConfirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            )}

            {error && (
              <div className="field-hint" style={{ color: 'var(--loss)', opacity: 1, marginBottom: '10px' }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div className="field-hint" style={{ color: 'var(--profit)', opacity: 1, marginBottom: '10px' }}>
                {successMsg}
              </div>
            )}

            <button type="submit" className="btn btn-accent submit-btn" disabled={submitting}>
              {submitting
                ? 'Memproses...'
                : mode === 'signin' ? 'Sign In'
                : mode === 'signup' ? 'Create Account'
                : 'Kirim Link Reset'}
            </button>
          </form>

          <div className="login-switch">
            {mode === 'signin' && (
              <>Belum punya akun? <button type="button" onClick={() => switchMode('signup')}>Sign up</button></>
            )}
            {mode === 'signup' && (
              <>Sudah punya akun? <button type="button" onClick={() => switchMode('signin')}>Sign in</button></>
            )}
            {mode === 'reset' && (
              <>Inget passwordnya? <button type="button" onClick={() => switchMode('signin')}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
