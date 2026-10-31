import { useEffect, useState } from 'react';
import { ASMAUL_HUSNA } from '../data/asmaulHusna';
import type { AsmaName } from '../data/asmaulHusna';

// Berganti tiap 3 detik → satu putaran penuh 99 nama ≈ 4 menit 57 detik.
const ROTATE_MS = 3_000;

export interface AsmaRotation {
    index: number;
    name: AsmaName;
}

// Rotasi Asmaul Husna. Dipakai kaligrafi di dalam piringan jam
// (lihat DialCalligraphy).
export const useAsmaRotation = (): AsmaRotation => {
    const [index, setIndex] = useState(() => Math.floor(Math.random() * ASMAUL_HUSNA.length));

    useEffect(() => {
        const timer = setInterval(
            () => setIndex(i => (i + 1) % ASMAUL_HUSNA.length),
            ROTATE_MS
        );
        return () => clearInterval(timer);
    }, []);

    return { index, name: ASMAUL_HUSNA[index] };
};
