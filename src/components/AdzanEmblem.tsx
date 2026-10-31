import React from 'react';

// Emblem overlay azan/doa, pengganti emoji 🕌/🤲. Garis & isi memakai
// currentColor (= --ov: emas saat azan, teal saat doa), jadi ikut tema langit.
// Semua animasi di CSS (.ae-*) hanya transform & opacity — tanpa filter animasi
// yang dulu bikin layar berkedip.

// Garis-garis sinar di belakang (berputar sangat pelan).
const Rays: React.FC = () => (
    <g className="ae-rays">
        {[...Array(16)].map((_, i) => (
            <line key={i} x1="100" y1="6" x2="100" y2="30" transform={`rotate(${i * 22.5} 100 100)`} />
        ))}
    </g>
);

const Mosque: React.FC = () => (
    <>
        <Rays />

        {/* Bulan sabit & bintang di langit */}
        <mask id="ae-moon-cut">
            <rect width="200" height="200" fill="#fff" />
            <circle cx="160" cy="34" r="11" fill="#000" />
        </mask>
        <circle className="ae-moon" cx="154" cy="38" r="12" mask="url(#ae-moon-cut)" />
        <circle className="ae-star s0" cx="128" cy="22" r="1.6" />
        <circle className="ae-star s1" cx="58" cy="30" r="1.3" />
        <circle className="ae-star s2" cx="176" cy="70" r="1.2" />
        <circle className="ae-star s3" cx="22" cy="44" r="1.1" />

        {/* Gelombang suara azan dari puncak menara kiri & kanan */}
        <g className="ae-call left">
            <path className="ae-wave w0" d="M22 58 a10 10 0 0 0 0 14" />
            <path className="ae-wave w1" d="M16 53 a17 17 0 0 0 0 24" />
            <path className="ae-wave w2" d="M10 48 a24 24 0 0 0 0 34" />
        </g>
        <g className="ae-call right">
            <path className="ae-wave w0" d="M178 58 a10 10 0 0 1 0 14" />
            <path className="ae-wave w1" d="M184 53 a17 17 0 0 1 0 24" />
            <path className="ae-wave w2" d="M190 48 a24 24 0 0 1 0 34" />
        </g>

        {/* Bangunan: isi lembut lalu garis tepi yang "tergambar" saat muncul */}
        <g className="ae-fill">
            <path d="M62 112 C62 82 86 72 100 52 C114 72 138 82 138 112 Z" />
            <rect x="56" y="112" width="88" height="58" />
            <rect x="28" y="72" width="14" height="98" />
            <rect x="158" y="72" width="14" height="98" />
        </g>

        <g className="ae-line">
            {/* Kubah, finial & bulan sabit kecil di puncak */}
            <path pathLength={1} d="M62 112 C62 82 86 72 100 52 C114 72 138 82 138 112" />
            <path pathLength={1} d="M100 52 V40" />
            <path pathLength={1} d="M104 31 a5 5 0 1 0 0 8 a4 4 0 1 1 0 -8" />
            {/* Badan masjid */}
            <path pathLength={1} d="M56 112 H144 M56 118 H144 M56 112 V170 M144 112 V170" />
            {/* Menara kiri & kanan: badan, balkon, atap kerucut */}
            <path pathLength={1} d="M30 170 V74 M40 170 V74 M26 94 H44 M26 99 H44 M29 74 L35 58 L41 74 Z" />
            <path pathLength={1} d="M160 170 V74 M170 170 V74 M156 94 H174 M156 99 H174 M159 74 L165 58 L171 74 Z" />
            {/* Tanah */}
            <path pathLength={1} d="M10 170 H190" />
        </g>

        {/* Cahaya dari dalam masjid: pintu & jendela berpendar bergantian */}
        <path className="ae-light l0" d="M90 170 V148 a10 10 0 0 1 20 0 V170 Z" />
        <path className="ae-light l1" d="M68 152 V138 a5 5 0 0 1 10 0 V152 Z" />
        <path className="ae-light l2" d="M122 152 V138 a5 5 0 0 1 10 0 V152 Z" />
        <path className="ae-light l1" d="M33 128 V120 a2 2 0 0 1 4 0 V128 Z" />
        <path className="ae-light l2" d="M163 128 V120 a2 2 0 0 1 4 0 V128 Z" />
    </>
);

const Lantern: React.FC = () => (
    <>
        <Rays />
        {/* Seluruh lentera berayun dari titik gantung (100, 8) */}
        <g className="ae-swing">
            <circle className="ae-flame-glow" cx="100" cy="112" r="46" />
            <g className="ae-line">
                <path pathLength={1} d="M100 8 V38" />
                <path pathLength={1} d="M95 38 a5 5 0 1 0 10 0" />
                <path pathLength={1} d="M80 56 L100 42 L120 56 Z" />
                <path pathLength={1} d="M80 60 H120 L130 84 V132 L120 154 H80 L70 132 V84 Z" />
                <path pathLength={1} d="M70 84 H130 M70 132 H130 M90 60 V154 M110 60 V154" />
                <path pathLength={1} d="M84 154 L100 172 L116 154" />
            </g>
            <g className="ae-flame">
                <path d="M100 88 C109 101 113 110 107 120 C103 126 97 126 93 120 C87 110 91 101 100 88 Z" />
                <path className="ae-flame-core" d="M100 104 C104 110 105 114 102 118 C100 120 99 120 97 117 C95 113 97 109 100 104 Z" />
            </g>
        </g>
        <circle className="ae-star s0" cx="40" cy="40" r="1.6" />
        <circle className="ae-star s1" cx="164" cy="30" r="1.3" />
        <circle className="ae-star s2" cx="170" cy="150" r="1.2" />
        <circle className="ae-star s3" cx="30" cy="140" r="1.1" />
    </>
);

const AdzanEmblem: React.FC<{ doa: boolean }> = ({ doa }) => (
    <svg className={`adzan-emblem ${doa ? 'is-doa' : 'is-adzan'}`} viewBox="0 0 200 200" aria-hidden="true">
        <defs>
            <radialGradient id="ae-glow">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ae-fill-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
            </linearGradient>
        </defs>
        {/* Halo lembut di belakang emblem (opacity-nya "bernapas" via CSS) */}
        <circle className="ae-halo" cx="100" cy="110" r="90" fill="url(#ae-glow)" />
        {doa ? <Lantern /> : <Mosque />}
    </svg>
);

export default AdzanEmblem;
