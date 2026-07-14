import { useEffect, useRef, useState } from 'react';

// Dipakai di elemen yang overflow-y:auto (tabel riwayat, isi modal, dst).
// Ngecek apakah kontennya beneran lebih tinggi dari area yang keliatan (jadi beneran bisa discroll).
// Kalau iya, komponen pemanggil bisa nampilin "penutup" tipis di bagian bawah
// (persis kayak header tapi kecil & tanpa tulisan) biar potongan konten paling bawah
// nggak keliatan kepotong mentah-mentah. Kalau kontennya muat semua (nggak perlu scroll),
// tampilannya otomatis balik normal (nggak ada penutup tambahan sama sekali).
export function useScrollBottomCap(deps = []) {
  const ref = useRef(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setScrollable(el.scrollHeight - el.clientHeight > 1);
    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [ref, scrollable];
}
