import MetaApi from 'metaapi.cloud-sdk';

// Berapa hari ke belakang riwayat deal yang ditarik buat isi dashboard.
const HISTORY_DAYS = 90;

// Ambil data akun MT4/MT5 asli dari MetaApi: saldo/equity terkini + riwayat
// trade yang sudah closed, lalu diubah ke bentuk yang dipahami dashboard ini
// (sama seperti bentuk yang dihasilkan mockAccountData.genAccount).
//
// CATATAN JUJUR: R-multiple (`r`) dan risk dolar (`risk`) di tiap trade nggak
// bisa dihitung akurat dari data deal doang (butuh jarak entry-ke-stop-loss
// dari order aslinya, yang nggak kita tarik di sini). Jadi utk trade hasil
// auto-sync, kedua field itu diisi 0 daripada dikarang jadi angka palsu.
export async function fetchLiveAccountData(token, accountId) {
  const api = new MetaApi(token);

  const account = await api.metatraderAccountApi.getAccount(accountId);

  if (account.state !== 'DEPLOYED') {
    await account.deploy();
  }
  await account.waitConnected();

  const connection = account.getRPCConnection();
  await connection.connect();
  await connection.waitSynchronized();

  const accountInfo = await connection.getAccountInformation();

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const result = await connection.getDealsByTimeRange(startTime, endTime);
  const deals = result?.deals || result || [];

  // Cuma deal yang MENUTUP posisi (DEAL_ENTRY_OUT / DEAL_ENTRY_OUT_BY) yang
  // punya realized profit/loss. Deal DEAL_ENTRY_IN (buka posisi) profit-nya 0.
  const closingDeals = deals.filter(
    (d) => d.entryType === 'DEAL_ENTRY_OUT' || d.entryType === 'DEAL_ENTRY_OUT_BY'
  );

  const trades = closingDeals
    .map((d) => ({
      date: (d.brokerTime || d.time).slice(0, 10),
      pair: d.symbol,
      dir: d.type === 'DEAL_TYPE_SELL' ? 'SELL' : 'BUY',
      size: d.volume,
      pl: +((d.profit || 0) + (d.commission || 0) + (d.swap || 0)).toFixed(2),
      risk: 0, // lihat catatan di atas fungsi ini
      r: 0,
      src: 'auto',
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Rekonstruksi kurva equity mundur dari balance saat ini (nggak ada endpoint
  // "riwayat balance harian" yang simpel di RPC API, jadi kita hitung sendiri).
  const totalPl = trades.reduce((sum, t) => sum + t.pl, 0);
  let runningBalance = accountInfo.balance - totalPl;
  const equityByDate = new Map();
  for (const t of trades) {
    runningBalance += t.pl;
    equityByDate.set(t.date, +runningBalance.toFixed(2));
  }
  const todayStr = endTime.toISOString().slice(0, 10);
  equityByDate.set(todayStr, +accountInfo.balance.toFixed(2));
  const equity = Array.from(equityByDate.entries())
    .map(([date, balance]) => ({ date, balance }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    trades,
    equity,
    liveBalance: accountInfo.balance,
    liveEquity: accountInfo.equity,
    currency: accountInfo.currency,
  };
}
