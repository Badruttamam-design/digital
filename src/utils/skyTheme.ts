// Tema "langit": palet warna aplikasi bergeser mengikuti periode waktu sholat,
// jadi tampilan pagi, siang, senja, dan malam terasa beda tanpa perlu setting.
//
// Kuncinya dipakai sebagai [data-sky="..."] di .app-zen-wrapper (lihat index.css).

import { toSeconds } from './converter';

export type SkyPeriod = 'lail' | 'fajr' | 'duha' | 'zuhur' | 'asr' | 'maghrib';

export const SKY_LABELS: Record<SkyPeriod, string> = {
    lail: 'Lail',
    fajr: 'Fajar',
    duha: 'Dhuha',
    zuhur: 'Siang',
    asr: 'Ashar',
    maghrib: 'Senja',
};

interface Timings { [key: string]: string }

// Periode ditentukan dari jadwal hari ini. Tanpa jadwal, fallback ke jam dinding
// supaya warna tetap masuk akal saat data belum termuat / offline.
export const skyPeriodOf = (timings: Timings | null, now: Date = new Date()): SkyPeriod => {
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    if (!timings?.Fajr) {
        const h = now.getHours();
        if (h < 4) return 'lail';
        if (h < 6) return 'fajr';
        if (h < 11) return 'duha';
        if (h < 15) return 'zuhur';
        if (h < 18) return 'asr';
        if (h < 19) return 'maghrib';
        return 'lail';
    }

    const fajr = toSeconds(timings.Fajr);
    // Sunrise dikirim Aladhan; kalau kosong pakai Fajr + 75 menit sebagai perkiraan.
    const sunrise = timings.Sunrise ? toSeconds(timings.Sunrise) : fajr + 75 * 60;
    const dhuhr = toSeconds(timings.Dhuhr);
    const asr = toSeconds(timings.Asr);
    const maghrib = toSeconds(timings.Maghrib);
    const isha = toSeconds(timings.Isha);

    if (nowSec < fajr) return 'lail';
    if (nowSec < sunrise) return 'fajr';
    if (nowSec < dhuhr) return 'duha';
    if (nowSec < asr) return 'zuhur';
    if (nowSec < maghrib) return 'asr';
    if (nowSec < isha) return 'maghrib';
    return 'lail';
};

export interface SkySegment {
    period: SkyPeriod;
    startSec: number;
    endSec: number;
}

// Pembagian satu hari penuh (0..86400 detik) menjadi periode langit, urut kronologis.
// Dipakai roda hari 24 jam. Segmen berdurasi 0 dibuang agar tidak menggambar busur kosong.
export const skySegments = (timings: Timings | null): SkySegment[] => {
    if (!timings?.Fajr) return [];

    const DAY = 24 * 3600;
    const fajr = toSeconds(timings.Fajr);
    const sunrise = timings.Sunrise ? toSeconds(timings.Sunrise) : fajr + 75 * 60;
    const dhuhr = toSeconds(timings.Dhuhr);
    const asr = toSeconds(timings.Asr);
    const maghrib = toSeconds(timings.Maghrib);
    const isha = toSeconds(timings.Isha);

    // Malam terpotong tengah malam, jadi muncul dua kali: dini hari & setelah Isya.
    const raw: SkySegment[] = [
        { period: 'lail', startSec: 0, endSec: fajr },
        { period: 'fajr', startSec: fajr, endSec: sunrise },
        { period: 'duha', startSec: sunrise, endSec: dhuhr },
        { period: 'zuhur', startSec: dhuhr, endSec: asr },
        { period: 'asr', startSec: asr, endSec: maghrib },
        { period: 'maghrib', startSec: maghrib, endSec: isha },
        { period: 'lail', startSec: isha, endSec: DAY },
    ];

    return raw.filter(s => s.endSec - s.startSec > 30);
};
