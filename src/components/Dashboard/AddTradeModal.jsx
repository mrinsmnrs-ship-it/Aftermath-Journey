import { useState } from 'react';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTradeModal({ open, onClose, onAddTrade }) {
  const [date, setDate] = useState(todayStr());
  const [pair, setPair] = useState('');
  const [dir, setDir] = useState('BUY');
  const [size, setSize] = useState('');
  const [pl, setPl] = useState('');
  const [risk, setRisk] = useState('');

  function resetForm() {
    setDate(todayStr());
    setPair('');
    setDir('BUY');
    setSize('');
    setPl('');
    setRisk('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const plNum = parseFloat(pl);
    if (Number.isNaN(plNum)) return;

    const riskNum = parseFloat(risk);
    const hasRisk = !Number.isNaN(riskNum) && riskNum > 0;
    const r = hasRisk ? +(plNum / riskNum).toFixed(2) : 0;

    onAddTrade({
      date,
      pair: pair.trim().toUpperCase() || '—',
      dir,
      size: size.trim() || '0.00',
      pl: +plNum.toFixed(2),
      risk: hasRisk ? +riskNum.toFixed(2) : 0,
      r,
      src: 'manual',
    });
    resetForm();
  }

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-head">
          <h2>Input Trade Manual</h2>
          <button className="btn modal-close" onClick={handleClose} aria-label="Tutup">✕</button>
        </div>
        <div className="modal-sub">Catat trade yang belum ke-sync otomatis dari broker.</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="tDate">Tanggal</label>
            <input
              type="date"
              id="tDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="tPair">Pair</label>
            <input
              type="text"
              id="tPair"
              placeholder="cth. EURUSD"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Arah</label>
            <div className="type-toggle">
              <button type="button" className={dir === 'BUY' ? 'active' : ''} onClick={() => setDir('BUY')}>
                Buy
              </button>
              <button type="button" className={dir === 'SELL' ? 'active' : ''} onClick={() => setDir('SELL')}>
                Sell
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="tSize">Size (lot)</label>
            <input
              type="number"
              step="0.01"
              id="tSize"
              placeholder="cth. 0.50"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="tPl">P/L ($)</label>
            <input
              type="number"
              step="0.01"
              id="tPl"
              placeholder="cth. 45.20 atau -30"
              value={pl}
              onChange={(e) => setPl(e.target.value)}
              required
            />
            <div className="field-hint">Isi negatif untuk loss, cth. -30.</div>
          </div>

          <div className="field">
            <label htmlFor="tRisk">Risk ($) — opsional</label>
            <input
              type="number"
              step="0.01"
              id="tRisk"
              placeholder="cth. 50"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            />
            <div className="field-hint">Dipakai buat hitung R Multiple. Kosongkan kalau nggak tahu.</div>
          </div>

          <button type="submit" className="btn btn-accent submit-btn">Simpan Trade</button>
        </form>
      </div>
    </div>
  );
}
