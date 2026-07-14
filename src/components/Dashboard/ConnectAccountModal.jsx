import { useState } from 'react';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

// Feature flag: sembunyikan dulu field integrasi MetaApi (Account ID & Token)
// sampai backend proxy-nya siap buat dipakai publik. Set ke `true` lagi kalau
// mau aktifin form connect real. Kode fetch/connect-nya tetap utuh, nggak
// dihapus apapun.
const METAAPI_CONNECT_ENABLED = false;

export default function ConnectAccountModal({ open, onClose, onConnect }) {
  const [nickname, setNickname] = useState('');
  const [type, setType] = useState('Funded');
  const [accountId, setAccountId] = useState('');
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  useBodyScrollLock(open);

  function resetForm() {
    setNickname('');
    setType('Funded');
    setAccountId('');
    setToken('');
    setConnecting(false);
    setError('');
  }

  function handleClose() {
    if (connecting) return; // jangan biarin ditutup di tengah proses connect
    resetForm();
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = nickname.trim() || 'Akun Baru';
    setError('');
    setConnecting(true);
    try {
      // Kalau Account ID & Token diisi, onConnect bakal coba connect asli ke MetaApi.
      // Kalau dikosongin, onConnect fallback ke generator data demo (nggak akan error).
      await onConnect({ name, type, accountId: accountId.trim(), token: token.trim() });
      resetForm();
    } catch (err) {
      setConnecting(false);
      setError(err?.message || 'Gagal connect ke MetaApi. Cek lagi Account ID & API Token-nya.');
    }
  }

  const usingRealApi = accountId.trim() !== '' || token.trim() !== '';

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <div className="modal-head-top">
            <h2>Tambah Akun</h2>
            <button className="btn modal-close" onClick={handleClose} aria-label="Tutup" disabled={connecting}>✕</button>
          </div>
          <div className="modal-sub">
            {METAAPI_CONNECT_ENABLED
              ? 'Isi Account ID & API Token MetaApi buat sync data akun MT4/MT5 asli kamu. Kosongin kalau cuma mau lihat preview dashboard pakai data simulasi.'
              : 'Buat akun baru buat lihat preview dashboard pakai data simulasi. Sinkronisasi akun MT4/MT5 asli lagi disiapkan, nyusul segera.'}
          </div>
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
              disabled={connecting}
            />
          </div>

          <div className="field">
            <label>Tipe Akun</label>
            <div className="type-toggle">
              <button type="button" className={type === 'Funded' ? 'active' : ''} onClick={() => setType('Funded')} disabled={connecting}>
                Funded
              </button>
              <button type="button" className={type === 'Personal' ? 'active' : ''} onClick={() => setType('Personal')} disabled={connecting}>
                Personal
              </button>
            </div>
          </div>

          {METAAPI_CONNECT_ENABLED && (
            <>
              <div className="field-section-title">Integrasi MetaApi (opsional)</div>

              <div className="field">
                <label htmlFor="fAccountId">MetaApi Account ID</label>
                <input
                  type="text"
                  id="fAccountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="mis. 23ccdd23-0b8a-400d-9aba-0129de365ba9"
                  disabled={connecting}
                />
              </div>

              <div className="field">
                <label htmlFor="fToken">API Token</label>
                <input
                  type="password"
                  id="fToken"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Account access token dari MetaApi"
                  disabled={connecting}
                />
                <div className="field-hint">
                  Token dipakai langsung dari browser buat connect ke MetaApi, nggak dikirim/disimpan ke server kami.
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="field-hint" style={{ color: 'var(--loss)', opacity: 1, marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-accent submit-btn" disabled={connecting}>
            {connecting
              ? 'Menghubungkan ke MetaApi...'
              : METAAPI_CONNECT_ENABLED && usingRealApi ? 'Connect & Sync' : 'Generate Akun Demo'}
          </button>
        </form>

        <div className="security-note">
          <svg className="security-note-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
          <span>
            {METAAPI_CONNECT_ENABLED
              ? 'Account ID & Token kosong → data yang muncul disimulasikan lokal, bukan data asli broker. Diisi → kita coba tarik saldo dan riwayat trade asli dari MetaApi (bisa makan waktu beberapa detik kalau akunnya baru pertama kali di-deploy).'
              : 'Data yang muncul di akun ini disimulasikan lokal buat keperluan preview, bukan data asli dari broker manapun.'}
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}
