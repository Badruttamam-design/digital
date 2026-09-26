import React from 'react';

interface AdzanOverlayProps {
    isAdzan: boolean;
    isDoa: boolean;
    text?: string | null;
    /** Jam berjalan, tetap ditampilkan kecil supaya waktu masih terbaca saat takeover. */
    clock?: string;
}

// Overlay LAYAR PENUH saat azan/waktu sholat masuk (emas) atau doa berjalan (teal).
//
// Dulu komponen ini anak .analog-clock dengan `inset: 0; border-radius: 50%`,
// jadi momen paling penting sehari-hari cuma tampil seukuran piringan jam.
// Sekarang dirender di tingkat .app-zen-wrapper dan menutupi seluruh layar.
const AdzanOverlay: React.FC<AdzanOverlayProps> = ({ isAdzan, isDoa, text, clock }) => {
    if (!isAdzan && !isDoa) return null;

    const doa = isDoa && !isAdzan; // azan diprioritaskan bila keduanya aktif

    return (
        <div className={`adzan-overlay ${doa ? 'doa' : 'adzan'}`}>
            {clock && <div className="adzan-clock">{clock}</div>}

            <div className="adzan-stage">
                <span className="adzan-ring" />
                <span className="adzan-wave" />
                <span className="adzan-wave" />
                <span className="adzan-wave" />
                <div className="adzan-emblem">{doa ? '🤲' : '🕌'}</div>
            </div>

            <div className="adzan-arabic">{doa ? 'دُعَاء' : 'حَيَّ عَلَى الصَّلَاة'}</div>
            <div className="adzan-text">{doa ? 'Waktu Doa' : (text || 'Panggilan Sholat')}</div>
        </div>
    );
};

export default AdzanOverlay;
