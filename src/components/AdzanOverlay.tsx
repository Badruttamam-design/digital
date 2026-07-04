import React from 'react';

interface AdzanOverlayProps {
    isAdzan: boolean;
    isDoa: boolean;
    text?: string | null;
}

// Overlay layar penuh dengan animasi gelombang saat azan/waktu sholat masuk (emas)
// atau saat doa berjalan (teal). Tampil selama isAdzan/isDoa true.
const AdzanOverlay: React.FC<AdzanOverlayProps> = ({ isAdzan, isDoa, text }) => {
    if (!isAdzan && !isDoa) return null;

    const doa = isDoa && !isAdzan; // azan diprioritaskan bila keduanya aktif

    return (
        <div className={`adzan-overlay ${doa ? 'doa' : 'adzan'}`}>
            <span className="adzan-ring" />
            <div className="adzan-stage">
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
