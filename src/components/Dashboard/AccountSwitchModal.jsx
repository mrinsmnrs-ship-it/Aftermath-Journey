export default function AccountSwitchModal({ open, accounts, currentAcctId, onSelect, onClose }) {
  return (
    <div
      className={`modal-overlay modal-center ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <h2>Pilih Akun</h2>
          <button className="btn modal-close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>
        <div className="modal-sub">Ganti akun trading yang sedang ditampilkan.</div>
        <div className="acct-list">
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`acct-item ${a.id === currentAcctId ? 'active' : ''}`}
              onClick={() => onSelect(a.id)}
            >
              <span className="acct-item-meta">
                <span>{a.name}</span>
                <span className="acct-item-type">{a.type}</span>
              </span>
              <svg className="acct-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
