import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// ============================================================================
// GANTI ISI OBJECT DI BAWAH INI dengan config dari project Firebase kamu sendiri.
//
// Cara ambil config:
// 1. Buka https://console.firebase.google.com -> buat project baru (gratis).
// 2. Di dalam project: klik ikon "</>" (Add app -> Web) buat daftarin web app.
// 3. Firebase bakal nampilin object persis kayak di bawah ini -> copy-paste ke sini.
// 4. Di sidebar kiri, buka "Build > Authentication" -> tab "Sign-in method"
//    -> aktifkan provider "Email/Password".
// 5. Di sidebar kiri, buka "Build > Firestore Database" -> "Create database"
//    -> pilih mode "production".
//
// Catatan: nilai-nilai di bawah ini (apiKey, dst) BUKAN rahasia/password.
// Firebase memang didesain supaya config ini boleh nempel di kode frontend/publik.
// Yang benar-benar menjaga keamanan data adalah "Firestore Security Rules"
// (lihat file firestore.rules di root project ini, dan panduan setup-nya).
// ============================================================================
const firebaseConfig = {
  apiKey: 'AIzaSyB_tE8QghpeCuXhT9O7d2Mo3F2PVWoJxCI',
  authDomain: 'aftermath-1a35f.firebaseapp.com',
  projectId: 'aftermath-1a35f',
  storageBucket: 'aftermath-1a35f.firebasestorage.app',
  messagingSenderId: '181373920804',
  appId: '1:181373920804:web:04b30550fa9f33ea5d9ab1',
};

const app = initializeApp(firebaseConfig);

// ============================================================================
// APP CHECK (anti-bot / anti-spam) — pakai reCAPTCHA v3, invisible ke user.
//
// Cara aktifin:
// 1. Buka Firebase Console -> project kamu -> menu "App Check" (di sidebar,
//    biasanya di bawah "Build" atau lewat pencarian).
// 2. Pilih app web kamu -> "Register" -> pilih provider "reCAPTCHA v3".
// 3. Firebase bakal generate site key otomatis -> copy site key itu, paste
//    ganti string 'GANTI_DENGAN_RECAPTCHA_V3_SITE_KEY' di bawah ini.
// 4. Balik ke halaman App Check -> tab "APIs" -> untuk "Authentication" dan
//    "Cloud Firestore", klik "Enforce". (Sebelum di-enforce, App Check cuma
//    memonitor, belum benar-benar nge-block trafik tanpa token.)
// 5. Kalau kamu develop di localhost, App Check butuh "debug token": buka
//    console browser pas dev mode, bakal muncul token debug di situ -> copy
//    -> paste di Firebase Console -> App Check -> "Manage debug tokens".
//
// Catatan: site key reCAPTCHA v3 ini SAMA seperti apiKey Firebase di atas —
// bukan rahasia, memang didesain untuk nempel di kode frontend/publik.
// ============================================================================
if (import.meta.env.PROD) {
  const RECAPTCHA_SITE_KEY = 'GANTI_DENGAN_RECAPTCHA_V3_SITE_KEY';
  if (RECAPTCHA_SITE_KEY === 'GANTI_DENGAN_RECAPTCHA_V3_SITE_KEY') {
    console.warn(
      '[App Check] Site key reCAPTCHA v3 belum diisi di src/firebase.js. ' +
      'Signup/login TETAP JALAN, tapi perlindungan anti-bot belum aktif.'
    );
  } else {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn('[App Check] Gagal diinisialisasi, lanjut tanpa App Check:', err);
    }
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
