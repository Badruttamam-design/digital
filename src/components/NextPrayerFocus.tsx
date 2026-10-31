import React from 'react';

/** Jendela mode "Jelang Sholat": 10 menit terakhir sebelum adzan. */
export const APPROACH_WINDOW_SEC = 600;

const ARABIC_NAMES: Record<string, string> = {
    Imsak: 'الإمساك',
    Fajr: 'الصبح',
    Dhuhr: 'الظهر',
    Jumat: 'الجمعة',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
};

interface NextPrayerFocusProps {
    /** Key jadwal ('Fajr', 'Dhuhr', ...). */
    prayerKey: string;
    displayName: string;
    time: string;
    secondsUntil: number;
    totalSeconds: number;
    isFriday: boolean;
    /** Aktif di 10 menit terakhir → di layar lebar tampil besar di tengah. */
    approach: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

const hintFor = (key: string, isFriday: boolean): string => {
    if (key === 'Imsak') return 'Segera akhiri sahur';
    if (key === 'Dhuhr' && isFriday) return 'Matikan HP · bersiap mendengarkan khutbah';
    return 'Bersiap wudhu · rapatkan & luruskan shaf';
};

// Kartu "sholat berikutnya". Satu komponen, dua peran:
// - HP (portrait): kartu besar di bawah jam, selalu tampil.
// - Layar lebar: tersembunyi, lalu muncul besar di tengah saat mode Jelang Sholat
//   (jam mengecil ke kiri). Di 60 detik terakhir hanya angka detik yang berdenyut.
const NextPrayerFocus: React.FC<NextPrayerFocusProps> = ({
    prayerKey, displayName, time, secondsUntil, totalSeconds, isFriday, approach,
}) => {
    const isFinal = approach && secondsUntil <= 60;
    const urgent = approach && secondsUntil <= 10;

    const h = Math.floor(secondsUntil / 3600);
    const m = Math.floor((secondsUntil % 3600) / 60);
    const s = secondsUntil % 60;
    const countText = isFinal
        ? String(secondsUntil)
        : h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

    const span = approach ? APPROACH_WINDOW_SEC : totalSeconds;
    const progress = span > 0 ? Math.min(Math.max(1 - secondsUntil / span, 0), 1) : 0;
    const arabic = ARABIC_NAMES[prayerKey === 'Dhuhr' && isFriday ? 'Jumat' : prayerKey];

    return (
        <section
            className={`next-focus ${approach ? 'is-approach' : ''} ${isFinal ? 'is-final' : ''} ${urgent ? 'is-urgent' : ''}`}
            aria-live="off"
        >
            <span className="nf-kicker">{approach ? 'Menjelang adzan' : 'Sholat berikutnya'}</span>

            <div className="nf-name">
                <span className="nf-name-id">{displayName}</span>
                {arabic && <span className="nf-name-ar" lang="ar">{arabic}</span>}
            </div>

            {/* key per detik di 60 detik terakhir → animasi denyut terputar ulang tiap detik */}
            <div className="nf-count" key={isFinal ? secondsUntil : 'count'}>
                {countText}
                {isFinal && <small className="nf-unit">detik</small>}
            </div>

            <div className="nf-bar" aria-hidden="true">
                <i style={{ width: `${progress * 100}%` }} />
            </div>

            <div className="nf-meta">
                <span>Adzan pukul <b>{time}</b></span>
                {approach && <span className="nf-hint">{hintFor(prayerKey, isFriday)}</span>}
            </div>
        </section>
    );
};

export default NextPrayerFocus;
