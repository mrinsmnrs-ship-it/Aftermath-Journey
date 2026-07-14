import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Semua data akun trading + riwayat trade user disimpan sebagai SATU dokumen
// di koleksi "users", dengan ID dokumen = uid dari Firebase Auth.
// Simpel & cukup buat ukuran data kayak gini (bukan ribuan trade per user).
function userDocRef(uid) {
  return doc(db, 'users', uid);
}

// Balikin { accounts, currentAcctId } kalau user ini udah pernah punya data
// tersimpan, atau `null` kalau ini user baru (belum pernah nyimpen apa-apa).
export async function loadUserData(uid) {
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data?.accounts) return null;
  return { accounts: data.accounts, currentAcctId: data.currentAcctId ?? null };
}

// Timpa data user dengan state akun yang paling baru. Dipanggil tiap kali
// ada perubahan (nambah trade, connect akun baru, ganti akun aktif).
export async function saveUserData(uid, { accounts, currentAcctId }) {
  await setDoc(userDocRef(uid), { accounts, currentAcctId, updatedAt: Date.now() });
}
