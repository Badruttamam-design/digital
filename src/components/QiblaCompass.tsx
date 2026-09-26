import React from 'react';
import { compassName, qiblaBearing } from '../utils/astro';

interface QiblaCompassProps {
    lat: number;
    lon: number;
}

const DIRS = [
    { label: 'U', deg: 0 },
    { label: 'T', deg: 90 },
    { label: 'S', deg: 180 },
    { label: 'B', deg: 270 },
];

// Kompas kiblat: sudut dihitung dari koordinat, ditampilkan relatif UTARA SEJATI
// (bukan kompas hidup — perangkat display tidak punya magnetometer).
const QiblaCompass: React.FC<QiblaCompassProps> = ({ lat, lon }) => {
    const bearing = qiblaBearing(lat, lon);

    return (
        <div className="qibla-widget">
            <svg viewBox="-50 -50 100 100" className="qibla-svg" aria-hidden="true">
                <circle r="44" className="qibla-ring" />
                <circle r="30" className="qibla-ring inner" />
                {/* Garis derajat tiap 15° */}
                {[...Array(24)].map((_, i) => (
                    <line
                        key={i}
                        x1="0" y1="-44" x2="0" y2={i % 6 === 0 ? -36 : -40}
                        className={`qibla-tick ${i % 6 === 0 ? 'major' : ''}`}
                        transform={`rotate(${i * 15})`}
                    />
                ))}
                {DIRS.map(d => (
                    <text
                        key={d.label}
                        className={`qibla-dir ${d.deg === 0 ? 'north' : ''}`}
                        x="0" y="-22"
                        transform={`rotate(${d.deg}) `}
                        textAnchor="middle"
                    >
                        {d.label}
                    </text>
                ))}
                {/* Jarum kiblat */}
                <g transform={`rotate(${bearing})`} className="qibla-needle">
                    <line x1="0" y1="8" x2="0" y2="-34" />
                    <polygon points="0,-42 -5,-30 5,-30" />
                    {/* Penanda Ka'bah di ujung jarum */}
                    <rect x="-3.4" y="-48" width="6.8" height="6" rx="1" className="qibla-kaaba" />
                </g>
                <circle r="3" className="qibla-hub" />
            </svg>
            <div className="qibla-meta">
                <span className="qibla-deg">{bearing.toFixed(1)}°</span>
                <span className="qibla-name">{compassName(bearing)}</span>
            </div>
        </div>
    );
};

export default QiblaCompass;
