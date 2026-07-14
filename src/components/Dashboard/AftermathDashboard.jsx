import { useMemo, useState } from 'react';
import EquityChart from './EquityChart';
import AccountSwitchModal from './AccountSwitchModal';
import ConnectAccountModal from './ConnectAccountModal';
import AddTradeModal from './AddTradeModal';
import LoginModal from './LoginModal';
import { generateInitialAccounts, genAccount, fmtMoney, fmtSigned } from '../../utils/mockAccountData';
import './AftermathDashboard.css';

const PERIODS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: 'ALL', value: 365 },
];

export default function AftermathDashboard() {
  const [accounts, setAccounts] = useState(() => generateInitialAccounts());
  const [currentAcctId, setCurrentAcctId] = useState(accounts[0].id);
  const [currentPeriod, setCurrentPeriod] = useState(30);
  const [acctModalOpen, setAcctModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [addTradeModalOpen, setAddTradeModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const currentAccount = accounts.find((a) => a.id === currentAcctId) ?? accounts[0];

  const slice = useMemo(
    () => currentAccount.equity.slice(-currentPeriod - 1),
    [currentAccount, currentPeriod]
  );

  const startBal = slice[0].balance;
  const endBal = slice[slice.length - 1].balance;
  const delta = endBal - startBal;
  const deltaPct = (delta / startBal) * 100;

  const periodTrades = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - currentPeriod);
    return currentAccount.trades.filter((t) => new Date(t.date) >= cutoff);
  }, [currentAccount, currentPeriod]);

  const wins = periodTrades.filter((t) => t.pl > 0);
  const losses = periodTrades.filter((t) => t.pl < 0);
  const totalPL = periodTrades.reduce((s, t) => s + t.pl, 0);
  const winRate = periodTrades.length ? (wins.length / periodTrades.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pl, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pl, 0) / losses.length : 0;
  // Avg R multiple: each trade's pl is normalized by its own risk amount first (r = pl / risk),
  // then averaged. This stays fair even when position sizing/risk varies from entry to entry,
  // unlike a plain avgWin/avgLoss dollar ratio.
  const avgR = periodTrades.length
    ? periodTrades.reduce((s, t) => s + t.r, 0) / periodTrades.length
    : 0;

  const maxDD = useMemo(() => {
    const vals = slice.map((p) => p.balance);
    let peak = vals[0];
    let dd = 0;
    vals.forEach((v) => {
      peak = Math.max(peak, v);
      dd = Math.max(dd, ((peak - v) / peak) * 100);
    });
    return dd;
  }, [slice]);

  // Rekap P/L per simbol buat lihat pair mana yang paling profitable di periode ini.
  const symbolPerf = useMemo(() => {
    const map = {};
    periodTrades.forEach((t) => {
      if (!map[t.pair]) map[t.pair] = { pair: t.pair, pl: 0, trades: 0 };
      map[t.pair].pl += t.pl;
      map[t.pair].trades += 1;
    });
    const list = Object.values(map);
    const maxAbs = Math.max(1, ...list.map((s) => Math.abs(s.pl)));
    return list
      .map((s) => ({ ...s, pct: Math.max(4, (Math.abs(s.pl) / maxAbs) * 100) }))
      .sort((a, b) => b.pl - a.pl);
  }, [periodTrades]);

  const rows = periodTrades.slice(-15).reverse();

  function handleConnect({ name, type }) {
    // NOTE: masih mock generator. Ganti bagian ini pas integrasi MetaApi asli.
    const newId = 'acc' + (accounts.length + 1) + '_' + Date.now();
    const seed = Math.floor(Math.random() * 900) + 100;
    const startBalance = type === 'Funded' ? 100000 : 2000;
    const winBias = 0.45 + Math.random() * 0.15;
    const newAcct = genAccount(newId, name, type, startBalance, seed, winBias);
    setAccounts((prev) => [...prev, newAcct]);
    setCurrentAcctId(newId);
    setConnectModalOpen(false);
  }

  function handleAddTrade(trade) {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== currentAcctId) return acc;

        // Selipkan trade baru sesuai urutan tanggal (data tersimpan ascending).
        const trades = [...acc.trades, trade].sort((a, b) => a.date.localeCompare(b.date));

        // Update kurva equity: kalau tanggalnya sama dengan titik terakhir, tambahkan
        // saldonya di titik itu; kalau tanggal baru, tambah titik baru di ujung.
        const equity = [...acc.equity];
        const lastPoint = equity[equity.length - 1];
        if (lastPoint && lastPoint.date === trade.date) {
          lastPoint.balance = +(lastPoint.balance + trade.pl).toFixed(2);
        } else {
          const prevBal = lastPoint ? lastPoint.balance : 0;
          equity.push({ date: trade.date, balance: +(prevBal + trade.pl).toFixed(2) });
        }

        return { ...acc, trades, equity };
      })
    );
    setAddTradeModalOpen(false);
  }

  return (
    <div className="aftermath-dashboard">
      <div className="wrap">
        <header>
          <div className="brand">
            <div className="mark">A.</div>
            <h1>AFTERMATH</h1>
          </div>
          <div className="header-actions header-actions-desktop">
            <button className="btn" type="button" onClick={() => setAddTradeModalOpen(true)}>+ Input Trade</button>
            <button className="acct-switch-btn" type="button" onClick={() => setAcctModalOpen(true)}>
              <span>{currentAccount.name}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 2.1l4 4-4 4"></path>
                <path d="M3 12.1v-2a4 4 0 014-4h14"></path>
                <path d="M7 21.9l-4-4 4-4"></path>
                <path d="M21 11.9v2a4 4 0 01-4 4H3"></path>
              </svg>
            </button>
            <button className="btn btn-accent" onClick={() => setConnectModalOpen(true)}>+ Connect Account</button>
            <button className="btn btn-square btn-square-blue" type="button" onClick={() => setLoginModalOpen(true)} aria-label="Sign in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>

          <div className="header-actions header-actions-mobile">
            <button className="btn btn-square" type="button" onClick={() => setAddTradeModalOpen(true)} aria-label="Input Trade">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
            </button>
            <button className="btn btn-square" type="button" onClick={() => setAcctModalOpen(true)} aria-label="Ganti Akun">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 2.1l4 4-4 4"></path>
                <path d="M3 12.1v-2a4 4 0 014-4h14"></path>
                <path d="M7 21.9l-4-4 4-4"></path>
                <path d="M21 11.9v2a4 4 0 01-4 4H3"></path>
              </svg>
            </button>
            <button className="btn btn-square btn-square-accent" type="button" onClick={() => setConnectModalOpen(true)} aria-label="Connect Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5l3 3"></path>
                <path d="M14.5 14.5l3 3"></path>
                <path d="M9 15l-3.5 3.5a2.5 2.5 0 01-3.5-3.5L5.5 11.5"></path>
                <path d="M15 9l3.5-3.5a2.5 2.5 0 013.5 3.5L18.5 12.5"></path>
                <path d="M8.5 9.5l6 6"></path>
              </svg>
            </button>
            <button className="btn btn-square btn-square-blue" type="button" onClick={() => setLoginModalOpen(true)} aria-label="Sign in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>
        </header>

        <div className="card equity-card">
          <div className="equity-top">
            <div>
              <div className="equity-label">{currentAccount.type} Account</div>
              <div className="equity-value">{fmtMoney(endBal)}</div>
              <div className={`delta-pill ${delta >= 0 ? 'delta-up' : 'delta-down'}`}>
                {delta >= 0 ? '▲' : '▼'} {fmtMoney(Math.abs(delta))} ({deltaPct.toFixed(1)}%)
              </div>
            </div>
            <div className="period-toggle">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  className={currentPeriod === p.value ? 'active' : ''}
                  onClick={() => setCurrentPeriod(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <EquityChart slice={slice} />
        </div>

        <div className="card symbol-card">
          <h2>Performa per Symbol</h2>
          {symbolPerf.length === 0 ? (
            <div className="symbol-empty">Belum ada trade di periode ini.</div>
          ) : (
            <div className="symbol-list">
              {symbolPerf.map((s) => (
                <div key={s.pair}>
                  <div className="symbol-row-top">
                    <span className="symbol-name">{s.pair}</span>
                    <span className={s.pl >= 0 ? 'pl-up' : 'pl-down'}>{fmtSigned(s.pl)}</span>
                  </div>
                  <div className="symbol-bar-track">
                    <div
                      className={`symbol-bar ${s.pl >= 0 ? 'symbol-bar-up' : 'symbol-bar-down'}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <div className="symbol-row-sub">{s.trades} trade</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="metrics">
          <div className={`card metric-card ${totalPL >= 0 ? 'tone-profit' : 'tone-loss'}`}>
            <div className="metric-label">P/L Periode Ini</div>
            <div className="metric-value">{fmtSigned(totalPL)}</div>
            <div className="metric-sub">{periodTrades.length} trade</div>
          </div>
          <div className={`card metric-card ${winRate >= 50 ? 'tone-profit' : 'tone-loss'}`}>
            <div className="metric-label">Win Rate</div>
            <div className="metric-value">{winRate.toFixed(0)}%</div>
            <div className="metric-sub">{wins.length}W / {losses.length}L</div>
          </div>
          <div className="card metric-card tone-profit">
            <div className="metric-label">Avg Win</div>
            <div className="metric-value">{fmtSigned(avgWin)}</div>
            <div className="metric-sub">rata-rata profit</div>
          </div>
          <div className="card metric-card tone-loss">
            <div className="metric-label">Avg Loss</div>
            <div className="metric-value">{fmtSigned(avgLoss)}</div>
            <div className="metric-sub">rata-rata rugi</div>
          </div>
          <div className={`card metric-card ${avgR >= 0 ? 'tone-profit' : 'tone-loss'}`}>
            <div className="metric-label">R Multiple</div>
            <div className="metric-value">
              {periodTrades.length ? `${avgR >= 0 ? '+' : ''}${avgR.toFixed(2)}R` : '—'}
            </div>
            <div className="metric-sub">rata-rata per trade</div>
          </div>
          <div className={`card metric-card ${maxDD === 0 ? '' : 'tone-loss'}`}>
            <div className="metric-label">Max Drawdown</div>
            <div className="metric-value">-{maxDD.toFixed(1)}%</div>
            <div className="metric-sub">titik terendah</div>
          </div>
        </div>

        <div className="card history-card">
          <h2>Riwayat Trade</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Tanggal</th><th>Pair</th><th>Arah</th><th>Size</th><th>P/L</th></tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ color: 'var(--ink)', textAlign: 'center', padding: '20px' }}>
                      Belum ada trade di periode ini.
                    </td>
                  </tr>
                ) : (
                  rows.map((t, i) => (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td>{t.pair}</td>
                      <td><span className={`tag ${t.dir === 'BUY' ? 'tag-buy' : 'tag-sell'}`}>{t.dir}</span></td>
                      <td>{t.size}</td>
                      <td className={t.pl >= 0 ? 'pl-up' : 'pl-down'}>{fmtSigned(t.pl)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer>Data disinkronkan otomatis dari MetaApi &middot; Terakhir sync 2 menit lalu</footer>
      </div>

      <AccountSwitchModal
        open={acctModalOpen}
        accounts={accounts}
        currentAcctId={currentAcctId}
        onSelect={(id) => { setCurrentAcctId(id); setAcctModalOpen(false); }}
        onClose={() => setAcctModalOpen(false)}
      />

      <ConnectAccountModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnect}
      />

      <AddTradeModal
        open={addTradeModalOpen}
        onClose={() => setAddTradeModalOpen(false)}
        onAddTrade={handleAddTrade}
      />

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={({ mode, email }) => console.log(`${mode} attempt:`, email)}
      />
    </div>
  );
}
