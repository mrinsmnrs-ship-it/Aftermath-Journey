import { useState } from 'react';
import { useScrollBottomCap } from '../../utils/useScrollBottomCap';

// Format Date -> value siap pakai buat <input type="datetime-local">, presisi ke menit.
function nowLocal() {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const initialState = {
  openTime: nowLocal(),
  closeTime: nowLocal(),
  pair: '',
  dir: 'BUY',
  size: '',
  entryPrice: '',
  exitPrice: '',
  sl: '',
  tp: '',
  plGross: '',
  commission: '',
  swap: '',
};

export default function AddTradeModal({ open, onClose, onAddTrade }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [bodyRef, scrollable] = useScrollBottomCap([open, error]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function resetForm() {
    setForm(initialState);
    setError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();

    const entryNum = parseFloat(form.entryPrice);
    const exitNum = parseFloat(form.exitPrice);
    const plGrossNum = parseFloat(form.plGross);
    const sizeTrim = form.size.trim();

    if (!form.pair.trim() || !sizeTrim) {
      setError('Pair dan Size wajib diisi.');
      return;
    }
    if (!form.openTime || !form.closeTime) {
      setError('Waktu buka dan tutup wajib diisi.');
      return;
    }
    if (form.closeTime < form.openTime) {
      setError('Waktu tutup nggak boleh sebelum waktu buka.');
      return;
    }
    if (Number.isNaN(entryNum) || Number.isNaN(exitNum)) {
      setError('Entry Price dan Exit Price wajib diisi dengan angka.');
      return;
    }
    if (Number.isNaN(plGrossNum)) {
      setError('P/L Kotor wajib diisi dengan angka (isi negatif kalau loss).');
      return;
    }

    // SL opsional: kalau diisi & valid, R multiple ke-hitung dari jarak entry-SL,
    // dibandingkan sama jarak entry-exit ke arah yang sama (jadi netral dari lot size).
    const slNum = parseFloat(form.sl);
    const hasSl = !Number.isNaN(slNum) && slNum !== entryNum;
    let r = 0;
    if (hasSl) {
      const riskDist = Math.abs(entryNum - slNum);
      const profitDist = form.dir === 'BUY' ? exitNum - entryNum : entryNum - exitNum;
      r = riskDist > 0 ? +(profitDist / riskDist).toFixed(2) : 0;
    }

    // TP opsional, cuma buat catatan — nggak masuk hitungan apa pun.
    const tpNum = parseFloat(form.tp);
    const hasTp = !Number.isNaN(tpNum);

    const commissionNum = parseFloat(form.commission);
    const swapNum = parseFloat(form.swap);
    const commission = Number.isNaN(commissionNum) ? 0 : commissionNum;
    const swap = Number.isNaN(swapNum) ? 0 : swapNum;
    const plNet = +(plGrossNum + commission + swap).toFixed(2);

    onAddTrade({
      // 'date' tetap disediakan (diambil dari closeTime) biar kompatibel sama
      // fitur yang udah ada: filter periode, kurva equity, dan tabel riwayat.
      date: form.closeTime.slice(0, 10),
      openTime: form.openTime,
      closeTime: form.closeTime,
      pair: form.pair.trim().toUpperCase() || '—',
      dir: form.dir,
      size: sizeTrim || '0.00',
      entryPrice: entryNum,
      exitPrice: exitNum,
      sl: hasSl ? slNum : null,
      tp: hasTp ? tpNum : null,
      plGross: +plGrossNum.toFixed(2),
      commission: +commission.toFixed(2),
      swap: +swap.toFixed(2),
      // 'pl' = net P/L (kotor + komisi + swap). Ini yang dipakai buat kurva equity,
      // total P/L, win rate, dst — karena itu yang beneran ngaruh ke saldo akun.
      pl: plNet,
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
          <div className="modal-head-top">
            <h2>Input Trade Manual</h2>
            <button className="btn modal-close" onClick={handleClose} aria-label="Tutup">✕</button>
          </div>
          <div className="modal-sub">Catat trade yang belum ke-sync otomatis dari broker.</div>
        </div>
        <div className={`modal-body${scrollable ? ' has-scroll-cap' : ''}`} ref={bodyRef}>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="tPair">Pair</label>
            <input
              type="text"
              id="tPair"
              value={form.pair}
              onChange={set('pair')}
              required
            />
          </div>

          <div className="field">
            <label>Arah</label>
            <div className="type-toggle">
              <button type="button" className={form.dir === 'BUY' ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, dir: 'BUY' }))}>
                Buy
              </button>
              <button type="button" className={form.dir === 'SELL' ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, dir: 'SELL' }))}>
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
              value={form.size}
              onChange={set('size')}
              required
            />
          </div>

          <div className="field-section-title">Waktu</div>
          <div className="field">
            <label htmlFor="tOpen">Waktu Buka</label>
            <input
              type="datetime-local"
              id="tOpen"
              value={form.openTime}
              onChange={set('openTime')}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="tClose">Waktu Tutup</label>
            <input
              type="datetime-local"
              id="tClose"
              value={form.closeTime}
              onChange={set('closeTime')}
              required
            />
          </div>

          <div className="field-section-title">Harga</div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="tEntry">Entry Price</label>
              <input
                type="number"
                step="any"
                id="tEntry"
                value={form.entryPrice}
                onChange={set('entryPrice')}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="tExit">Exit Price</label>
              <input
                type="number"
                step="any"
                id="tExit"
                value={form.exitPrice}
                onChange={set('exitPrice')}
                required
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field field-optional">
              <label htmlFor="tSl">Stop Loss</label>
              <input
                type="number"
                step="any"
                id="tSl"
                value={form.sl}
                onChange={set('sl')}
              />
            </div>
            <div className="field field-optional">
              <label htmlFor="tTp">Take Profit</label>
              <input
                type="number"
                step="any"
                id="tTp"
                value={form.tp}
                onChange={set('tp')}
              />
            </div>
          </div>
          <div className="field-hint" style={{ marginTop: '-6px', marginBottom: '14px' }}>
            Isi Stop Loss buat auto-hitung R Multiple dari jarak entry-SL. Take Profit cuma catatan, nggak dipakai hitungan.
          </div>

          <div className="field-section-title">P/L</div>
          <div className="field">
            <label htmlFor="tPlGross">P/L Kotor ($)</label>
            <input
              type="number"
              step="0.01"
              id="tPlGross"
              value={form.plGross}
              onChange={set('plGross')}
              required
            />
            <div className="field-hint">Hasil aktual dari broker. Isi negatif untuk loss, cth. -30.</div>
          </div>
          <div className="field-row">
            <div className="field field-optional">
              <label htmlFor="tCommission">Komisi ($)</label>
              <input
                type="number"
                step="0.01"
                id="tCommission"
                value={form.commission}
                onChange={set('commission')}
              />
            </div>
            <div className="field field-optional">
              <label htmlFor="tSwap">Swap ($)</label>
              <input
                type="number"
                step="0.01"
                id="tSwap"
                value={form.swap}
                onChange={set('swap')}
              />
            </div>
          </div>
          <div className="field-hint" style={{ marginTop: '-6px', marginBottom: '14px' }}>
            Komisi biasanya negatif, Swap bisa plus atau minus. Keduanya ngurangin/nambahin P/L bersih.
          </div>

          {error && (
            <div className="field-hint" style={{ color: 'var(--loss)', opacity: 1, marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-accent submit-btn">Simpan Trade</button>
        </form>
        {scrollable && <div className="scroll-cap" aria-hidden="true" />}
        </div>
        <div className="modal-bottom-space" aria-hidden="true" />
      </div>
    </div>
  );
}
