// Firebase Auth ngebalikin error kayak "auth/invalid-email", "auth/wrong-password", dst.
// Fungsi ini nerjemahin ke pesan yang enak dibaca user biasa.
export function translateAuthError(err) {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Format email nggak valid.';
    case 'auth/user-disabled':
      return 'Akun ini dinonaktifkan. Hubungi admin.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Email atau password salah.';
    case 'auth/wrong-password':
      return 'Password salah.';
    case 'auth/email-already-in-use':
      return 'Email ini udah kedaftar. Coba Sign In.';
    case 'auth/weak-password':
      return 'Password minimal 6 karakter.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Coba lagi beberapa saat lagi.';
    case 'auth/network-request-failed':
      return 'Koneksi bermasalah. Cek internet kamu.';
    case 'auth/configuration-not-found':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Konfigurasi Firebase belum diisi dengan benar (lihat src/firebase.js).';
    default:
      return 'Gagal memproses permintaan. Coba lagi.';
  }
}
