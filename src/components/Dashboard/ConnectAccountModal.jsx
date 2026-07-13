import { useState } from 'react';

export default function ConnectAccountModal({ open, onClose, onConnect }) {
  const [nickname, setNickname] = useState('');
  const [accountId, setAccountId] = useState('');
  const [token, setToken] = useState('');
  const [type, setType] = useState('Funded');

  function resetForm() {
    setNickname('');
    setAccountId('');
    setToken('');
    setType('Funded');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = nickname.trim() || 'Akun Baru';
    onConnect({ name, type, accountId, token });
    resetForm();
  }

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <h2>Connect Account</h2>
          <button className="btn modal-close" onClick={handleClose} aria-label="Tutup">✕</button>
        </div>
        <div className="modal-body">
        <div className="modal-sub">Hubungkan akun MT4/MT5 kamu lewat MetaApi. Sekali connect, data auto-sync.</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fNickname">Nama Akun</label>
            <input
              type="text"
              id="fNickname"
              placeholder="cth. FTMO Challenge #83"
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

          <div className="field">
            <label htmlFor="fAccountId">MetaApi Account ID</label>
            <input
              type="text"
              id="fAccountId"
              placeholder="cth. 8a2f9c1e-..."
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="fToken">API Token</label>
            <input
              type="password"
              id="fToken"
              placeholder="Token dari MetaApi dashboard"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <div className="field-hint">Token dikirim langsung ke server, tidak pernah disimpan di browser.</div>
          </div>

          <button type="submit" className="btn btn-accent submit-btn">Connect & Sync</button>
        </form>

        <div className="security-note">🔒 Token disimpan terenkripsi di server. Kamu bisa putuskan koneksi kapan saja.</div>
        </div>
      </div>
    </div>
  );
}
