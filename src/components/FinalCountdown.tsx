import React from 'react';

interface FinalCountdownProps {
    secondsLeft: number;
    /** Disembunyikan saat adzan sudah berkumandang agar tidak bertumpuk overlay. */
    suppressed?: boolean;
}

const WINDOW_SEC = 60;

// Satu menit terakhir sebelum adzan: angka raksasa di tengah layar, menyusut &
// meredup tiap detik.
//
// Hanya angka, tanpa label. Muka jam sudah menyebut nama sholatnya, dan teks
// tambahan di tengah layar menabrak jam digital serta tanggal di baliknya.
// Selama hitungan berjalan, isi muka jam diredupkan lewat :has() di index.css.
const FinalCountdown: React.FC<FinalCountdownProps> = ({ secondsLeft, suppressed }) => {
    if (suppressed || secondsLeft <= 0 || secondsLeft > WINDOW_SEC) return null;

    // Sepuluh detik terakhir dibuat lebih tegas.
    const urgent = secondsLeft <= 10;

    return (
        <div className={`final-countdown ${urgent ? 'urgent' : ''}`} aria-live="off">
            {/* key = detik → elemen dipasang ulang, animasi denyut terputar tiap detik */}
            <span className="fc-number" key={secondsLeft}>{secondsLeft}</span>
        </div>
    );
};

export default FinalCountdown;
