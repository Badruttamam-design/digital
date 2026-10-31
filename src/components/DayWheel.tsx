import React from 'react';
import { skySegments } from '../utils/skyTheme';
import type { SkyPeriod } from '../utils/skyTheme';

interface DayWheelProps {
    prayerTimes: Record<string, string> | null;
    nowSec: number;
}

const C = 240;        // pusat viewBox 480x480
// Kotak roda 1,14x piringan (lihat .day-wheel), jadi tepi piringan jatuh di
// radius 240/1.14 ≈ 210 dan cincin tepi .analog-clock::before di ≈ 217.
// Busur ditaruh di 228 agar bersih dari keduanya dan tetap di dalam 240.
const R = 228;        // jari-jari busur periode
const R_LABEL = 238;  // jari-jari label jam
const DAY = 24 * 3600;

// Tengah malam di atas, berputar searah jarum jam (satu putaran = 24 jam).
const angleOf = (sec: number) => (sec / DAY) * 360;

const point = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) };
};

const arcPath = (fromDeg: number, toDeg: number, r: number) => {
    const a = point(fromDeg, r);
    const b = point(toDeg, r);
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

const HOUR_LABELS = [0, 6, 12, 18];

// Roda hari 24 jam di luar piringan jam: tiap periode langit dapat busurnya sendiri,
// sehingga seluruh bentuk hari terbaca sekaligus — lengkap dengan penanda "sekarang".
// Melengkapi penanda 12 jam di dalam piringan, yang hanya menunjukkan titik waktu sholat.
const DayWheel: React.FC<DayWheelProps> = ({ prayerTimes, nowSec }) => {
    const segments = skySegments(prayerTimes);
    if (segments.length === 0) return null;

    const nowDeg = angleOf(nowSec);
    const nowInner = point(nowDeg, R - 10);
    const nowOuter = point(nowDeg, R + 10);
    const nowDot = point(nowDeg, R);

    // Periode yang sedang berjalan disorot; sisanya diredupkan.
    const activePeriod: SkyPeriod | null =
        segments.find(s => nowSec >= s.startSec && nowSec < s.endSec)?.period ?? null;

    return (
        <div className="day-wheel" aria-hidden="true">
            <svg viewBox="0 0 480 480">
                {/* Lintasan dasar supaya roda tetap terbaca sebagai satu lingkaran utuh */}
                <circle cx={C} cy={C} r={R} className="wheel-track" />

                {segments.map((seg, i) => (
                    <path
                        key={`${seg.period}-${i}`}
                        d={arcPath(angleOf(seg.startSec), angleOf(seg.endSec), R)}
                        className={`wheel-seg ${seg.period} ${activePeriod === seg.period ? 'on' : ''}`}
                    />
                ))}

                {/* Guratan tiap 3 jam sebagai pembanding cepat */}
                {[...Array(8)].map((_, i) => {
                    const deg = i * 45;
                    const a = point(deg, R - 7);
                    const b = point(deg, R + 7);
                    return (
                        <line
                            key={deg}
                            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                            className={`wheel-tick ${i % 2 === 0 ? 'major' : ''}`}
                        />
                    );
                })}

                {HOUR_LABELS.map(h => {
                    const p = point(angleOf(h * 3600), R_LABEL);
                    return (
                        <text
                            key={h}
                            x={p.x} y={p.y}
                            className="wheel-hour"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {String(h).padStart(2, '0')}
                        </text>
                    );
                })}

                {/* Penanda "sekarang" */}
                <line
                    x1={nowInner.x} y1={nowInner.y} x2={nowOuter.x} y2={nowOuter.y}
                    className="wheel-now-line"
                />
                <circle cx={nowDot.x} cy={nowDot.y} r="5" className="wheel-now-dot" />
            </svg>
        </div>
    );
};

export default DayWheel;
