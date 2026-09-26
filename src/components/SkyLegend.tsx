import React from 'react';
import type { SkyPeriod } from '../utils/skyTheme';

// Nama yang dipakai di layar untuk tiap busur roda hari 24 jam.
const PERIODS: { key: SkyPeriod; name: string }[] = [
    { key: 'lail', name: 'Malam' },
    { key: 'fajr', name: 'Fajar' },
    { key: 'duha', name: 'Dhuha' },
    { key: 'zuhur', name: 'Siang' },
    { key: 'asr', name: 'Sore' },
    { key: 'maghrib', name: 'Senja' },
];

// Keterangan warna roda hari 24 jam, plus satu baris untuk dua cincin tipis
// di dalam piringan. Tanpa ini cincin-cincinnya cuma jadi hiasan yang
// membingungkan — tidak ada yang tahu artinya tanpa dijelaskan.
const SkyLegend: React.FC<{ current: SkyPeriod }> = ({ current }) => (
    <div className="sky-legend">
        <div className="sky-legend-grid">
            {PERIODS.map(p => (
                <span
                    key={p.key}
                    className={`sky-legend-item ${p.key} ${p.key === current ? 'on' : ''}`}
                >
                    <i />
                    {p.name}
                </span>
            ))}
        </div>
        <span className="sky-legend-note">
            Luar: 24 jam · merah muda: detik · teal: menuju sholat
        </span>
    </div>
);

export default SkyLegend;
