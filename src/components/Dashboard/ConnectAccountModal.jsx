import { useState } from 'react';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

export default function ConnectAccountModal({ open, onClose, onConnect }) {
  const [nickname, setNickname] = useState('');
  const [type, setType] = useState('Funded');
  const [accountId, setAccountId] = useState('');
  const [token, setToken] = useState('');
  useBodyScrollLock(open);

  function resetForm() {
    setNickname('');
    setType('Funded');
    setAccountId('');
    setToken('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = nickname.trim() || 'Akun Baru';
    // NOTE: accountId & token belum dipakai — integrasi MetaApi asli belum ada.
    // Field-nya sengaja tetap ditampilkan (tapi disabled) supaya strukturnya udah
    // siap begitu backend real-nya jadi; tinggal lepas `disabled` di bawah + connect ke API.
    onConnect({ name, type });
    resetForm();
  }

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <div className="modal-head-top">
            <h2>Tambah Akun (Demo)</h2>
            <button className="btn modal-close" onClick={handleClose} aria-label="Tutup">✕</button>
          </div>
          <div className="modal-sub">Integrasi MetaApi/MT4/MT5 asli belum tersedia. Fitur ini men-generate data trading simulasi biar kamu bisa coba-coba tampilan dashboard.</div>
        </div>
        <div className="modal-body modal-body-static">

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fNickname">Nama Akun</label>
            <input
              type="text"
              id="fNickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Tipe Akun</label>
            <div className="type-toggle">
              <button type="button" className={type === 'Funded' ? 'active' : ''} onClick={() => setType('Funded')}>
                Funded
              </button>
              <button type="button" className={type === 'Personal' ? 'active' : ''} onClick={() => setType('Personal')}>
                Personal
              </button>
            </div>
          </div>

          <div className="field-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Integrasi MetaApi
            <span
              style={{
                fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.04em', padding: '2px 7px', borderRadius: '999px',
                background: 'var(--profit-tint)', color: 'var(--profit-dark)',
              }}
            >
              Segera Hadir
            </span>
          </div>

          <div className="field">
            <label htmlFor="fAccountId">MetaApi Account ID</label>
            <input
              type="text"
              id="fAccountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Belum aktif"
              disabled
            />
          </div>

          <div className="field">
            <label htmlFor="fToken">API Token</label>
            <input
              type="password"
              id="fToken"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Belum aktif"
              disabled
            />
            <div className="field-hint">
              Field ini belum tersambung ke backend apa pun — isian di sini nggak dipakai/dikirim kemana-mana.
              Sementara data akun di-generate simulasi berdasarkan Nama &amp; Tipe Akun di atas.
            </div>
          </div>

          <button type="submit" className="btn btn-accent submit-btn">Generate Akun Demo</button>
        </form>

        <div className="security-note">
          <svg className="security-note-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
          <span>Mode demo: data equity dan riwayat trade di sini di-generate acak di perangkatmu sendiri, bukan data asli dari broker. Belum ada koneksi ke MetaApi atau MT4/MT5.</span>
        </div>
        </div>
      </div>
    </div>
  );
}
