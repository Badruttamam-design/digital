import React, { useEffect, useState } from 'react';
import { formatHijriDate } from '../utils/converter';
import { DAY_NAMES, MONTH_NAMES } from '../constants';

interface AnalogClockProps {
    prayerProgress?: {
        secondsUntil: number;
        totalSeconds: number;
        isNear: boolean;
        nextPrayerName: string;
    };
    locationName?: string;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ prayerProgress, locationName }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const hourDeg = (hours % 12) * 30 + (minutes / 60) * 30;
    const minuteDeg = minutes * 6;
    // Fix: Use total seconds in day to prevent 59s -> 0s rewind glitch
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const secondDeg = totalSeconds * 6;
    const activeSecondNumber = seconds % 5 === 0 ? (seconds === 0 ? 12 : seconds / 5) : null;

    const dayIndex = time.getDay();
    const dateStr = `${DAY_NAMES[dayIndex]}, ${String(time.getDate()).padStart(2, '0')} ${MONTH_NAMES[time.getMonth()]} ${time.getFullYear()}`;
    const hijriDate = formatHijriDate(time);

    // Ring Dimensions
    const RADIUS_SEC = 226;
    const CIRCUM_SEC = 2 * Math.PI * RADIUS_SEC;

    const RADIUS_PRAYER = 218;
    const CIRCUM_PRAYER = 2 * Math.PI * RADIUS_PRAYER;

    // Progress Calculations
    // Continuous forward motion (Wipe effect)
    // Uses total minutes elapsed to drive the offset continuously
    const totalMinutesElapsed = totalSeconds / 60;
    const dashOffsetSec = CIRCUM_SEC * (1 - totalMinutesElapsed);

    let progressPrayer = 0;
    if (prayerProgress && prayerProgress.totalSeconds > 0) {
        progressPrayer = 1 - (prayerProgress.secondsUntil / prayerProgress.totalSeconds);
    }

    const dashOffsetPrayer = CIRCUM_PRAYER * (1 - progressPrayer);

    return (
        <div className={`clock-container ${prayerProgress?.isNear ? 'countdown-active' : ''}`}>
            <div className="analog-clock">
                {/* Progress Rings - Moved before ticks, Z-Index managed in CSS */}
                <svg className="progress-ring" width="100%" height="100%" viewBox="0 0 480 480">
                    {/* Ring 2: Prayer Progress (Inner) */}
                    {prayerProgress && (
                        <circle
                            className="progress-ring-circle prayer"
                            strokeWidth="4"
                            fill="none"
                            r={RADIUS_PRAYER}
                            cx="240"
                            cy="240"
                            style={{
                                strokeDasharray: CIRCUM_PRAYER,
                                strokeDashoffset: dashOffsetPrayer,
                                stroke: 'var(--primary)'
                            }}
                        />
                    )}

                    {/* Ring 1: Seconds (Outer) */}
                    <circle
                        className="progress-ring-circle seconds"
                        strokeWidth="3"
                        fill="none"
                        r={RADIUS_SEC}
                        cx="240"
                        cy="240"
                        style={{
                            strokeDasharray: CIRCUM_SEC,
                            strokeDashoffset: dashOffsetSec,
                            stroke: 'var(--secondary)'
                        }}
                    />
                </svg>

                <div className="tick-marks">
                    {[...Array(60)].map((_, i) => (
                        <div
                            key={i}
                            className={`tick ${i % 5 === 0 ? 'hour' : ''}`}
                            style={{ transform: `rotate(${i * 6}deg)` } as any}
                        />
                    ))}
                </div>

                {/* Numbers */}
                {[...Array(12)].map((_, i) => {
                    const n = i + 1;
                    return (
                        <div
                            key={n}
                            className={`number ${activeSecondNumber === n ? 'active-second' : ''}`}
                            style={{ '--n': n } as any}
                        >
                            <b style={{ '--n': n } as any}>{n}</b>
                        </div>
                    );
                })}

                {/* Neon Hands */}
                <div className="hand hour-hand" style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }} />
                <div className="hand minute-hand" style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }} />
                <div className="hand second-hand" style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}>
                    <div className="hand-glow" />
                </div>
                <div className="center-dot" />

                {/* Digital HUD */}
                <div id="digital-clock" className="digital-clock">
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                    <span className="seconds">{String(seconds).padStart(2, '0')}</span>
                </div>

                <div id="date" className="date">{dateStr}</div>
                <div id="location" className="location">{locationName}</div>

                <div id="islamic-date" className="islamic">{hijriDate}</div>

                {prayerProgress?.nextPrayerName && (
                    <div id="nextPrayerText" className="prayer">
                        {prayerProgress.nextPrayerName}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalogClock;
