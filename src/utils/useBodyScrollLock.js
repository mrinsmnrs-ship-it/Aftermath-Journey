import { useEffect } from 'react';

// Counter global: kalau ada lebih dari satu modal yang kebetulan "open" bareng,
// scroll body cuma di-restore pas modal TERAKHIR yang nutup (bukan langsung
// kebuka dikit karena modal lain masih ada).
let lockCount = 0;
let prevOverflow = '';

// Dipakai di setiap modal: matikan scroll halaman/latar belakang selama modal
// terbuka, tapi scroll DI DALAM modal (.modal-body) tetap jalan normal karena
// itu container terpisah dengan overflow-y sendiri.
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = prevOverflow;
      }
    };
  }, [active]);
}
