import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Mantau status login secara real-time. `loading` true cuma sebentar di awal,
// pas Firebase lagi ngecek apakah ada sesi login yang tersimpan di browser.
// Selama loading, JANGAN dianggap "belum login" — nanti data akun bisa
// ke-reset ke demo padahal user aslinya udah login.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
