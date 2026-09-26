import React from 'react';
import { hijriParts, toArabicNumerals } from '../utils/converter';
import { moonLitPath, moonPhaseFromHijriDay, moonPhaseLabel } from '../utils/astro';

const R = 26;

// Bulan kecil dengan bentuk fase asli (dihitung dari tanggal Hijriah), bukan emoji.
const MoonPhase: React.FC<{ date?: Date }> = ({ date = new Date() }) => {
    const { day } = hijriParts(date);
    const phase = moonPhaseFromHijriDay(day);
    const litPath = moonLitPath(phase, R);

    return (
        <div className="moon-widget" title={`${moonPhaseLabel(day)} — ${day} hari`}>
            <svg viewBox="-34 -34 68 68" className="moon-svg" aria-hidden="true">
                <defs>
                    <radialGradient id="moonLit" cx="35%" cy="30%" r="80%">
                        <stop offset="0%" stopColor="#fffdf5" />
                        <stop offset="60%" stopColor="#f5e6c8" />
                        <stop offset="100%" stopColor="#cdb68b" />
                    </radialGradient>
                </defs>
                {/* Piringan gelap: sisi bulan yang tidak kena matahari */}
                <circle r={R} className="moon-dark" />
                {/* Sisi terang */}
                <path d={litPath} fill="url(#moonLit)" className="moon-lit" />
                {/* Garis tepi tipis supaya piringan tetap terbaca saat hilal */}
                <circle r={R} className="moon-rim" />
            </svg>
            <div className="moon-meta">
                <span className="moon-label">{moonPhaseLabel(day)}</span>
                <span className="moon-day">{toArabicNumerals(day)} · hari ke-{day}</span>
            </div>
        </div>
    );
};

export default MoonPhase;
