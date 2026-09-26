import React from 'react';

interface RollingDigitsProps {
    value: string;
}

// Jam digital dengan digit berguling: tiap angka yang berubah meluncur masuk dari atas.
//
// Animasinya dipicu lewat `key` — saat angkanya berganti React memasang ulang elemennya,
// sehingga animasi CSS terputar dari awal. Cara ini aman di StrictMode (yang me-render
// dua kali) dan tidak perlu menyimpan nilai sebelumnya.
const RollingDigits: React.FC<RollingDigitsProps> = ({ value }) => (
    <span className="roll">
        {value.split('').map((ch, i) => {
            const isDigit = ch >= '0' && ch <= '9';
            return (
                <span key={i} className={`roll-cell ${isDigit ? '' : 'sep'}`}>
                    {isDigit
                        // key berisi posisi + angka: berganti hanya bila angka di posisi itu berubah.
                        ? <span className="roll-in" key={`${i}-${ch}`}>{ch}</span>
                        : ch}
                </span>
            );
        })}
    </span>
);

export default RollingDigits;
