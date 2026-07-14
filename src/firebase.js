import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
  apiKey: 'GANTI_DENGAN_API_KEY_KAMU',
  authDomain: 'GANTI_DENGAN_PROJECT_ID.firebaseapp.com',
  projectId: 'GANTI_DENGAN_PROJECT_ID',
  storageBucket: 'GANTI_DENGAN_PROJECT_ID.appspot.com',
  messagingSenderId: 'GANTI_DENGAN_SENDER_ID',
  appId: 'GANTI_DENGAN_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
