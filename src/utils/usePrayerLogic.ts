import { useState, useEffect, useCallback, useRef } from 'react';
import { toSeconds } from './converter';

interface PrayerTimings {
    Imsak: string;
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

const PRAYER_DISPLAY_NAMES: Record<string, string> = {
    Imsak: 'Imsak',
    Fajr: 'Subuh',
    Dhuhr: 'Dhuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya'
};

export const usePrayerLogic = (prayerTimes: PrayerTimings | null) => {
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; secondsUntil: number; totalSeconds: number } | null>(null);
    const [isAdzanRunning, setIsAdzanRunning] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);
    const [runningText, setRunningText] = useState<string | null>(null);
    const doaAudioRef = useRef<HTMLAudioElement | null>(null);
    const doaTimeoutRef = useRef<number | null>(null);
    const doaLastPlayedDateRef = useRef<string | null>(null);

    const playAzan = useCallback((prayerName: string) => {
        if (isAdzanRunning) return;

        setIsAdzanRunning(true);

        if (prayerName === 'Imsak') {
            setRunningText('Sekarang Sudah Masuk Waktu Imsak, Segera Bersiap Untuk Puasa!');
            setTimeout(() => {
                setIsAdzanRunning(false);
                setRunningText(null);
            }, 60000);
        } else {
            setRunningText(`Masuk Adzan Sholat ${PRAYER_DISPLAY_NAMES[prayerName] || prayerName}`);
            const audio = document.getElementById('azanAudio') as HTMLAudioElement;
            if (audio) {
                audio.src = prayerName === 'Subuh' ? '/assets/audio/azan_subuh.mp3' : '/assets/audio/adan.mp3';
                audio.play().catch(console.error);
                audio.onended = () => {
                    setIsAdzanRunning(false);
                    setRunningText(null);
                };
            }
            // Fallback 4 mins
            setTimeout(() => {
                setIsAdzanRunning(false);
                setRunningText(null);
            }, 240000);
        }
    }, [isAdzanRunning]);

    const playDoaForFiveMinutes = useCallback(() => {
        if (!doaAudioRef.current) {
            doaAudioRef.current = new Audio('/assets/audio/doa.mp3');
            doaAudioRef.current.preload = 'auto';
        }

        const doaAudio = doaAudioRef.current;
        doaAudio.loop = true;
        doaAudio.currentTime = 0;
        doaAudio.play().catch(console.error);

        if (doaTimeoutRef.current) {
            clearTimeout(doaTimeoutRef.current);
        }

        doaTimeoutRef.current = window.setTimeout(() => {
            doaAudio.pause();
            doaAudio.currentTime = 0;
            doaAudio.loop = false;
            doaTimeoutRef.current = null;
        }, 5 * 60 * 1000);
    }, []);

    useEffect(() => {
        if (!prayerTimes) return;

        const tick = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const currentTimeInSeconds = hours * 3600 + minutes * 60 + seconds;
            const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

            if (hours === 3 && minutes === 0 && doaLastPlayedDateRef.current !== todayKey) {
                doaLastPlayedDateRef.current = todayKey;
                playDoaForFiveMinutes();
            }

            const keys = ['Imsak', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let nextKey: string | null = null;
            let prevKey: string | null = null;
            let currentKey: string | null = null;

            for (let i = 0; i < keys.length; i++) {
                const timeInSec = toSeconds(prayerTimes[keys[i]]);
                if (timeInSec === currentTimeInSeconds) {
                    currentKey = keys[i];
                }
                if (timeInSec > currentTimeInSeconds && !nextKey) {
                    nextKey = keys[i];
                    prevKey = i === 0 ? keys[keys.length - 1] : keys[i - 1];
                }
            }

            if (!nextKey) {
                nextKey = 'Imsak';
                prevKey = 'Isha';
            }

            if (nextKey && prayerTimes[nextKey]) {
                const nextTimeInSeconds = toSeconds(prayerTimes[nextKey]);
                const prevTimeInSeconds = prevKey ? toSeconds(prayerTimes[prevKey]) : nextTimeInSeconds;

                let secondsUntilNext = nextTimeInSeconds - currentTimeInSeconds;
                if (secondsUntilNext < 0) secondsUntilNext += 24 * 3600;

                let totalBetween = nextTimeInSeconds - prevTimeInSeconds;
                if (totalBetween < 0) totalBetween += 24 * 3600;

                setNextPrayer({
                    name: nextKey,
                    time: prayerTimes[nextKey],
                    secondsUntil: secondsUntilNext,
                    totalSeconds: totalBetween
                });
            }

            if (currentKey) {
                playAzan(currentKey);
            }

            // Handle notifications < 3 mins
            if (nextKey) {
                const nextTimeInSeconds = toSeconds(prayerTimes[nextKey]);
                let secondsUntilNext = nextTimeInSeconds - currentTimeInSeconds;
                if (secondsUntilNext < 0) secondsUntilNext += 24 * 3600;

                if (secondsUntilNext < 180 && secondsUntilNext > 0) {
                    const m = Math.floor(secondsUntilNext / 60);
                    const s = secondsUntilNext % 60;
                    setNotification({
                        message: `⏰ ${PRAYER_DISPLAY_NAMES[nextKey] || nextKey} dalam ${m}:${String(s).padStart(2, '0')}`,
                        type: 'warning'
                    });
                } else {
                    setNotification(null);
                }
            }
        };

        const interval = setInterval(tick, 1000);
        tick();
        return () => {
            clearInterval(interval);

            if (doaTimeoutRef.current) {
                clearTimeout(doaTimeoutRef.current);
                doaTimeoutRef.current = null;
            }

            if (doaAudioRef.current) {
                doaAudioRef.current.pause();
                doaAudioRef.current.currentTime = 0;
                doaAudioRef.current.loop = false;
            }
        };
    }, [prayerTimes, playAzan, playDoaForFiveMinutes]);

    return { nextPrayer, isAdzanRunning, notification, runningText };
};
