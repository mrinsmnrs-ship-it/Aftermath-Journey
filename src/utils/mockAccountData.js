function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const PAIRS = ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY', 'GBPJPY', 'NAS100'];

export function genAccount(id, name, type, startBalance, seed, winBias) {
  const rand = seededRandom(seed);
  const days = 90;
  let bal = startBalance;
  const equity = [];
  const trades = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const tradesToday = rand() > 0.6 ? Math.floor(rand() * 3) + 1 : 0;

    for (let t = 0; t < tradesToday; t++) {
      const isWin = rand() < winBias;
      const pl = isWin
        ? +(rand() * 140 + 20).toFixed(2)
        : -(rand() * 90 + 15).toFixed(2);
      bal += pl;
      trades.push({
        date: d.toISOString().slice(0, 10),
        pair: PAIRS[Math.floor(rand() * PAIRS.length)],
        dir: rand() > 0.5 ? 'BUY' : 'SELL',
        size: (rand() * 2 + 0.1).toFixed(2),
        pl,
        src: rand() > 0.15 ? 'auto' : 'manual',
      });
    }
    equity.push({ date: d.toISOString().slice(0, 10), balance: bal });
  }

  return { id, name, type, equity, trades: trades.reverse() };
}

export function generateInitialAccounts() {
  return [
    genAccount('acc1', 'FTMO Challenge #82', 'Funded', 100000, 11, 0.52),
    genAccount('acc2', 'Personal — Exness', 'Personal', 5000, 47, 0.46),
    genAccount('acc3', 'Funded — The5ers', 'Funded', 25000, 93, 0.58),
  ];
}

export function fmtMoney(n) {
  const sign = n < 0 ? '-' : '';
  return sign + '$' + Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtSigned(n) {
  const sign = n < 0 ? '-' : '+';
  return sign + '$' + Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
