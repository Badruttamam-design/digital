import React from 'react';
import { toSeconds } from '../utils/converter';

interface DialMarkersProps {
    prayerTimes: Record<string, string> | null;
    nextPrayerKey?: string;
    nowSec: number;
}

// Singkatan 2 huruf supaya tetap terbaca di piringan jam tanpa berebut ruang.
const MARKS = [
    { id: 'Imsak', short: 'Im' },
    { id: 'Fajr', short: 'Sb' },
    { id: 'Dhuhr', short: 'Dz' },
    { id: 'Asr', short: 'As' },
    { id: 'Maghrib', short: 'Mg' },
    { id: 'Isha', short: 'Is' },
];

const C = 240;          // pusat viewBox 480x480
const R_DOT = 203;      // jari-jari titik penanda
const R_LABEL = 186;    // jari-jari label

// Sudut pada piringan 12 jam: jam 12 di atas, searah jarum jam.
const angleOf = (sec: number) => {
    const h = Math.floor(sec / 3600) % 12;
    const m = (sec % 3600) / 60;
    return h * 30 + m * 0.5;
};

const pos = (deg: number, r: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
};

// Titik jadwal sholat di piringan jam: yang sudah lewat meredup,
// yang berikutnya berdenyut. Jam jadi ikut bercerita, bukan cuma penunjuk waktu.
const DialMarkers: React.FC<DialMarkersProps> = ({ prayerTimes, nextPrayerKey, nowSec }) => {
    if (!prayerTimes) return null;

    return (
        <svg className="dial-markers" viewBox="0 0 480 480" aria-hidden="true">
            {MARKS.map(mark => {
                const raw = prayerTimes[mark.id];
                if (!raw) return null;

                const sec = toSeconds(raw);
                const deg = angleOf(sec);
                const dot = pos(deg, R_DOT);
                const label = pos(deg, R_LABEL);

                const isNext = mark.id === nextPrayerKey;
                const isPast = sec <= nowSec && !isNext;
                const state = isNext ? 'next' : isPast ? 'past' : 'ahead';

                return (
                    <g key={mark.id} className={`dial-mark ${state}`}>
                        {isNext && <circle cx={dot.x} cy={dot.y} r="11" className="dial-mark-halo" />}
                        <circle cx={dot.x} cy={dot.y} r={isNext ? 4.5 : 3} className="dial-mark-dot" />
                        <text x={label.x} y={label.y} className="dial-mark-label" textAnchor="middle" dominantBaseline="middle">
                            {mark.short}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default DialMarkers;
