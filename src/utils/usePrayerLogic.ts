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

const getPrayerDisplayName = (prayerKey: string, date: Date = new Date()) => {
    const isFriday = date.getDay() === 5;
    const names: Record<string, string> = {
        Imsak: 'Imsak',
        Fajr: 'Subuh',
        Dhuhr: isFriday ? 'Jumat' : 'Dhuhur',
        Asr: 'Ashar',
        Maghrib: 'Maghrib',
        Isha: 'Isya'
    };
    return names[prayerKey] || prayerKey;
};

// Sholat yang didahului tarhim (5 waktu fardhu; Imsak dilewati karena bukan waktu sholat).
const TARHIM_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Durasi tarhim ~5 menit 2 detik. Jadi nilai awal & cadangan bila metadata audio belum termuat,
// sehingga tarhim tetap mulai ~5:02 sebelum adzan meski durasi asli belum terbaca.
const TARHIM_FALLBACK_SECONDS = 302;

export const usePrayerLogic = (prayerTimes: PrayerTimings | null) => {
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; secondsUntil: number; totalSeconds: number } | null>(null);
    const [isAdzanRunning, setIsAdzanRunning] = useState(false);
    const [isDoaRunning, setIsDoaRunning] = useState(false);
    const [isTarhimRunning, setIsTarhimRunning] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);
    const [runningText, setRunningText] = useState<string | null>(null);
    const doaAudioRef = useRef<HTMLAudioElement | null>(null);
    const doaTimeoutRef = useRef<number | null>(null);
    const doaLastPlayedDateRef = useRef<string | null>(null);
    const tarhimAudioRef = useRef<HTMLAudioElement | null>(null);
    const tarhimDurationRef = useRef<number>(TARHIM_FALLBACK_SECONDS);
    const tarhimPlayedRef = useRef<string | null>(null);

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
            setRunningText(`Masuk Adzan Sholat ${getPrayerDisplayName(prayerName)}`);
            const audio = document.getElementById('azanAudio') as HTMLAudioElement;
            if (audio) {
                const basePath = import.meta.env.BASE_URL;
                // prayerName di sini adalah KEY jadwal ('Fajr'), bukan nama tampilan ('Subuh').
                audio.src = prayerName === 'Fajr'
                    ? `${basePath}assets/audio/azan_subuh.mp3`
                    : `${basePath}assets/audio/adan.mp3`;
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
            const basePath = import.meta.env.BASE_URL;
            doaAudioRef.current = new Audio(`${basePath}assets/audio/doa.mp3`);
            doaAudioRef.current.preload = 'auto';
        }

        const doaAudio = doaAudioRef.current;
        doaAudio.loop = true;
        doaAudio.currentTime = 0;
        doaAudio.play().catch(console.error);
        setIsDoaRunning(true);

        if (doaTimeoutRef.current) {
            clearTimeout(doaTimeoutRef.current);
        }

        doaTimeoutRef.current = window.setTimeout(() => {
            doaAudio.pause();
            doaAudio.currentTime = 0;
            doaAudio.loop = false;
            doaTimeoutRef.current = null;
            setIsDoaRunning(false);
        }, 5 * 60 * 1000);
    }, []);

    // Mulai tarhim sekali, di-offset agar SELESAI tepat saat waktu sholat, lalu tersambung ke adzan.
    const playTarhim = useCallback((prayerName: string, secondsUntilNext: number) => {
        const tarhim = tarhimAudioRef.current;
        if (!tarhim) return;

        tarhim.loop = false;
        // Sisa durasi tarhim dibuat = waktu menuju adzan, jadi tarhim berakhir persis di waktu sholat.
        const offset = Math.max(0, tarhimDurationRef.current - secondsUntilNext);
        try { tarhim.currentTime = offset; } catch { /* sebagian browser belum siap di-seek */ }
        tarhim.play().catch(console.error);
        setIsTarhimRunning(true);
        setRunningText(`Tarhim Menjelang Adzan ${getPrayerDisplayName(prayerName)}`);

        // Begitu tarhim habis, langsung sambung ke adzan.
        tarhim.onended = () => {
            setIsTarhimRunning(false);
            playAzan(prayerName);
        };
    }, [playAzan]);

    const stopTarhim = useCallback(() => {
        const tarhim = tarhimAudioRef.current;
        if (tarhim) {
            tarhim.pause();
            tarhim.onended = null;
        }
        setIsTarhimRunning(false);
    }, []);

    // Siapkan audio tarhim & baca durasinya. Durasi file = seberapa awal tarhim mulai sebelum adzan.
    useEffect(() => {
        const basePath = import.meta.env.BASE_URL;
        const audio = new Audio(`${basePath}assets/audio/tarhim.mp3`);
        audio.preload = 'auto';
        const onMeta = () => { tarhimDurationRef.current = audio.duration || TARHIM_FALLBACK_SECONDS; };
        audio.addEventListener('loadedmetadata', onMeta);
        tarhimAudioRef.current = audio;
        return () => {
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.pause();
            audio.onended = null;
            tarhimAudioRef.current = null;
        };
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

            // Tarhim menjelang adzan: mulai agar tarhim selesai tepat saat waktu sholat, lalu tersambung ke adzan.
            if (nextKey && TARHIM_PRAYERS.includes(nextKey) && tarhimDurationRef.current > 0) {
                const nextTimeInSeconds = toSeconds(prayerTimes[nextKey]);
                let secondsUntilNext = nextTimeInSeconds - currentTimeInSeconds;
                if (secondsUntilNext < 0) secondsUntilNext += 24 * 3600;

                const tarhimKey = `${todayKey}-${nextKey}`;
                if (secondsUntilNext > 0 && secondsUntilNext <= tarhimDurationRef.current && tarhimPlayedRef.current !== tarhimKey) {
                    tarhimPlayedRef.current = tarhimKey;
                    playTarhim(nextKey, secondsUntilNext);
                }
            }

            if (currentKey) {
                stopTarhim();
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
                        message: `⏰ ${getPrayerDisplayName(nextKey)} dalam ${m}:${String(s).padStart(2, '0')}`,
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
            setIsDoaRunning(false);
        };
    }, [prayerTimes, playAzan, playDoaForFiveMinutes, playTarhim, stopTarhim]);

    return { nextPrayer, isAdzanRunning, isDoaRunning, isTarhimRunning, notification, runningText };
};
