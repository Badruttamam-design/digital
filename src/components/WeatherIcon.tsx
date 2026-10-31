import React from 'react';

export type WeatherKind = 'clear' | 'partly' | 'fog' | 'drizzle' | 'snow' | 'storm';

// Awan dasar (viewBox 32×32): alas datar di y=24, puncak ~y=8.
const CLOUD = 'M9 24h14a5 5 0 0 0 0-10a7 7 0 0 0-13.3 1.8A4.2 4.2 0 0 0 9 24z';

const Sun: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
    <g className="wi-sun">
        <g className="wi-rays">
            {[...Array(8)].map((_, i) => (
                <line
                    key={i}
                    x1={cx} y1={cy - r - 2.2} x2={cx} y2={cy - r - 4.6}
                    transform={`rotate(${i * 45} ${cx} ${cy})`}
                />
            ))}
        </g>
        <circle cx={cx} cy={cy} r={r} />
    </g>
);

// Bulan sabit untuk malam: lingkaran dikurangi lingkaran yang digeser (mask).
const Moon: React.FC<{ cx: number; cy: number; r: number; id: string }> = ({ cx, cy, r, id }) => (
    <g className="wi-moon">
        <mask id={id}>
            <rect width="32" height="32" fill="#fff" />
            <circle cx={cx + r * 0.55} cy={cy - r * 0.35} r={r * 0.85} fill="#000" />
        </mask>
        <circle cx={cx} cy={cy} r={r} mask={`url(#${id})`} />
    </g>
);

// Ikon cuaca animasi. Hanya transform & opacity yang dianimasikan (ringan untuk display 24 jam).
const WeatherIcon: React.FC<{ kind: WeatherKind; isDay: boolean }> = ({ kind, isDay }) => {
    const celestial = (cx: number, cy: number, r: number) =>
        isDay ? <Sun cx={cx} cy={cy} r={r} /> : <Moon cx={cx} cy={cy} r={r + 1.5} id={`wi-moon-${kind}`} />;

    return (
        <svg viewBox="0 0 32 32" className={`weather-icon wi-${kind}`} aria-hidden="true">
            {kind === 'clear' && celestial(16, 16, 6)}

            {kind === 'partly' && (
                <>
                    {celestial(11.5, 11, 4.6)}
                    <path d={CLOUD} className="wi-cloud" transform="translate(2 2)" />
                </>
            )}

            {kind === 'fog' && (
                <>
                    <path d={CLOUD} className="wi-cloud dim" transform="translate(0 -3)" />
                    <line className="wi-fog" x1="6" y1="24.5" x2="22" y2="24.5" />
                    <line className="wi-fog delay" x1="10" y1="28" x2="26" y2="28" />
                </>
            )}

            {(kind === 'drizzle' || kind === 'storm') && (
                <>
                    <path d={CLOUD} className="wi-cloud" transform="translate(0 -5)" />
                    {[11, 16, 21].map((x, i) => (
                        <line key={x} className={`wi-drop d${i}`} x1={x} y1="21.5" x2={x - 1} y2="24.5" />
                    ))}
                    {kind === 'storm' && <path className="wi-bolt" d="M17 18l-3.2 6h2.8l-1.6 5.5 5-7.2h-2.9l1.9-4.3z" />}
                </>
            )}

            {kind === 'snow' && (
                <>
                    <path d={CLOUD} className="wi-cloud" transform="translate(0 -5)" />
                    {[11, 16, 21].map((x, i) => (
                        <circle key={x} className={`wi-flake d${i}`} cx={x} cy="22.5" r="1.1" />
                    ))}
                </>
            )}
        </svg>
    );
};

export default WeatherIcon;
