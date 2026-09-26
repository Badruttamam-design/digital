import React, { useEffect, useState, useCallback, useRef } from 'react';
import AnalogClock from './components/AnalogClock';
import RamadhanMode from './components/RamadhanMode';
import Weather from './components/Weather';
import Calendar from './components/Calendar';
import Notification from './components/Notification';
import MoonPhase from './components/MoonPhase';
import QiblaCompass from './components/QiblaCompass';
import FinalCountdown from './components/FinalCountdown';
import AdzanOverlay from './components/AdzanOverlay';
import SkyLegend from './components/SkyLegend';
import { useAsmaRotation } from './utils/useAsmaRotation';
import { fetchLocationName, fetchPrayerTimes } from './services/prayerService';
import type { PrayerTimings } from './services/prayerService';
import { usePrayerLogic } from './utils/usePrayerLogic';
import { hijriParts, hijriDaysInMonth, daysUntilRamadhan, toSeconds } from './utils/converter';
import { skyPeriodOf, SKY_LABELS } from './utils/skyTheme';

// Format sisa waktu menuju sholat, selalu dengan detik: "2j 05m 03d" / "12m 30d" / "45d".
const formatCountdown = (totalSec: number): string => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}j ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}d`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}d`;
  return `${s}d`;
};

const App: React.FC = () => {
  const [location, setLocation] = useState<string>('Mendeteksi Lokasi...');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);
  const [isRamadhan, setIsRamadhan] = useState(false);
  const [daysToEid, setDaysToEid] = useState(0);
  const [fastingDay, setFastingDay] = useState(0);
  const [totalFastingDays, setTotalFastingDays] = useState(30);
  const [daysToRamadhan, setDaysToRamadhan] = useState(0);
  const [locationVisible, setLocationVisible] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  // Koordinat terakhir disimpan di ref. Dulu ini state sekaligus dependency effect
  // geolokasi, jadi menyetelnya memicu effect itu lagi → GPS dibaca dua kali dan
  // jadwal sholat ikut diambil dua kali saat boot.
  const prevCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const basePath = import.meta.env.BASE_URL;

  const asma = useAsmaRotation();
  const { nextPrayer, isAdzanRunning, isDoaRunning, isTarhimRunning, runningText } = usePrayerLogic(prayerTimes);

  // Berubah nilainya saat tengah malam → dipakai sebagai pemicu refresh harian (display nyala 24 jam).
  const dayKey = now.toDateString();

  useEffect(() => {
    // Cek Ramadhan (bulan Hijriah ke-9). hijriParts sudah 1-indexed & offset -1 hari.
    const { month, day } = hijriParts(new Date());
    const daysInMonth = hijriDaysInMonth(new Date());

    setIsRamadhan(month === 9);
    setFastingDay(month === 9 ? day : 0);
    setTotalFastingDays(month === 9 ? daysInMonth : 30);
    setDaysToEid(daysInMonth - day + 1);
    setDaysToRamadhan(month === 9 ? 0 : daysUntilRamadhan(new Date()));
  }, [dayKey]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });

          // Check if location changed significantly
          const prev = prevCoordsRef.current;
          if (!prev || Math.abs(prev.lat - latitude) > 0.01 || Math.abs(prev.lon - longitude) > 0.01) {
            prevCoordsRef.current = { lat: latitude, lon: longitude };
            setLocationVisible(true);

            const locName = await fetchLocationName(latitude, longitude);
            setLocation(locName);
          }
        } catch (err) {
          console.error("App: Error in data fetching:", err);
          setLocation("Gagal mengambil data");
        }
      },
      (error) => {
        console.error("App: Geolocation error:", error);
        setLocation("Lokasi tidak dapat diakses");
      }
    );
  }, []);

  // Ambil/refresh jadwal sholat saat koordinat siap atau hari berganti (agar tidak basi lewat tengah malam).
  useEffect(() => {
    if (!coords) return;
    fetchPrayerTimes(coords.lat, coords.lon)
      .then(setPrayerTimes)
      .catch(err => console.error("App: Gagal refresh jadwal sholat:", err));
  }, [dayKey, coords]);

  const handleHideLocationNotification = useCallback(() => {
    setLocationVisible(false);
  }, []);

  // clockProps logic moved to JSX to avoid unused variable warning
  // Periode langit → mengganti palet warna seluruh halaman (lihat [data-sky] di index.css).
  const sky = skyPeriodOf(prayerTimes, now);
  const isFriday = now.getDay() === 5;
  // Detik berjalan hari ini — dipakai menghitung sisa waktu per baris jadwal sholat.
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const PRAYER_DISPLAY_NAMES: Record<string, string> = {
    Imsak: 'Imsak',
    Fajr: 'Subuh',
    Dhuhr: isFriday ? 'Jumat' : 'Dhuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya',
    Sunrise: 'Terbit'
  };

  const nextPrayerDisplay = nextPrayer
    ? `${PRAYER_DISPLAY_NAMES[nextPrayer.name] || nextPrayer.name} - ${Math.floor(nextPrayer.secondsUntil / 3600).toString().padStart(2, '0')}:${Math.floor((nextPrayer.secondsUntil % 3600) / 60).toString().padStart(2, '0')}:${(nextPrayer.secondsUntil % 60).toString().padStart(2, '0')}`
    : '';
  const fastingProgress = Math.min(Math.max((fastingDay / totalFastingDays) * 100, 0), 100);
  const fastingPercent = Math.round(fastingProgress);

  const maghribTimeRaw = prayerTimes?.Maghrib || '';
  const maghribMatch = maghribTimeRaw.match(/(\d{1,2}):(\d{2})/);
  let countdownToIftar = '--:--:--';
  let iftarStatus = 'Menunggu data Maghrib';

  if (maghribMatch) {
    const maghribHour = Number(maghribMatch[1]);
    const maghribMinute = Number(maghribMatch[2]);
    const maghribToday = new Date(now);
    maghribToday.setHours(maghribHour, maghribMinute, 0, 0);

    const diffMs = maghribToday.getTime() - now.getTime();
    if (diffMs > 0) {
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      countdownToIftar = `${hours}:${minutes}:${seconds}`;
      iftarStatus = 'Menuju waktu berbuka puasa';
    } else {
      countdownToIftar = '00:00:00';
      iftarStatus = 'Waktu berbuka puasa sudah masuk';
    }
  }

  return (
    <div className={`app-zen-wrapper ${isRamadhan ? 'ramadhan-mode' : ''}`} data-sky={sky}>
      {/* Background elements */}
      <div className="bg-mesh"></div>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>



      {/* Dedicated Layout Grid Container */}
      <main className="app-zen-grid">
        {/* Zone 1: Meta-Info & Controls (Left) */}
        <div className="zen-sidebar-left">
          <header className="zen-meta-top">
            <div className="zen-meta-item">
              <span className="label">Lokasi</span>
              <span className="content">{location}</span>
            </div>
            {coords && (
              <div className="zen-meta-item">
                <span className="label">Cuaca</span>
                <div className="content">
                  <Weather latitude={coords.lat} longitude={coords.lon} />
                </div>
              </div>
            )}
            <div className="zen-meta-item zen-sky-item">
              <span className="label">Langit</span>
              <div className="content zen-sky-row">
                <MoonPhase date={now} />
                {coords && <QiblaCompass lat={coords.lat} lon={coords.lon} />}
              </div>
              <span className="zen-sky-caption">Periode {SKY_LABELS[sky]} · arah kiblat dari utara sejati</span>
              <SkyLegend current={sky} />
            </div>
            {/* <div className="zen-meta-item zen-state-item">
              <span className="label">Keadaan</span>
              <span className="content">{isAdzanRunning ? 'Sedang Adzan' : isTarhimRunning ? 'Tarhim Menjelang Adzan' : (nextPrayer?.name === 'Imsak' ? 'Menunggu Waktu Imsak' : 'Menunggu Adzan ' + (PRAYER_DISPLAY_NAMES[nextPrayer?.name ?? ''] || nextPrayer?.name || ''))}</span>
            </div> */}
            <div className="zen-meta-item puasa-highlight">
              <span className="label">Puasa</span>
              <span className="content puasa-content">
                {isRamadhan ? (
                  <>
                    <strong>Puasa ke-{fastingDay}</strong>
                    <div className="puasa-percent">{fastingPercent}%</div>
                    <em>Progress Ramadhan</em>
                    <div className="puasa-progress-wrap" aria-label={`Progress puasa ${fastingDay} dari ${totalFastingDays} hari`}>
                      <div className="puasa-progress-bar">
                        <span style={{ width: `${fastingProgress}%` }} />
                      </div>
                      <small>{fastingDay}/{totalFastingDays} hari</small>
                    </div>
                    <div className="iftar-countdown" aria-live="polite">
                      <span>{iftarStatus}</span>
                      <strong>{countdownToIftar}</strong>
                    </div>
                  </>
                ) : (
                  <em>Ramadhan Kurang {daysToRamadhan} Hari Lagi</em>
                )}
              </span>
            </div>
            {isRamadhan && (
              <div className="zen-meta-item">
                <span className="label">Lebaran</span>
                <span className="content">Kurang {daysToEid} Hari Lagi</span>
              </div>
            )}
            {(isAdzanRunning || isTarhimRunning) && runningText && (
              <div className="zen-meta-item">
                <span className="label" style={{ color: 'var(--accent)' }}>Info</span>
                <span className="content running-text-sidebar">{runningText}</span>
              </div>
            )}
          </header>

          <nav className="zen-dock">
            <button
              className="zen-icon-btn"
              onClick={() => document.getElementById('calendar-toggle')?.click()}
              title="Kalender"
            >
              📅
            </button>
            {isRamadhan && (
              <button
                className="zen-icon-btn"
                onClick={() => document.getElementById('imsakiyah-toggle')?.click()}
                title="Imsakiyah"
              >
                📖
              </button>
            )}
          </nav>
        </div>

        {/* Zone 2: Focus - Analog Clock (Center) */}
        <section className="zen-main-focus">
          <AnalogClock
            prayerProgress={nextPrayer ? {
              secondsUntil: nextPrayer.secondsUntil,
              totalSeconds: nextPrayer.totalSeconds,
              isNear: nextPrayer.secondsUntil < 180,
              nextPrayerName: nextPrayerDisplay
            } : undefined}
            locationName={undefined}
            prayerTimes={prayerTimes}
            nextPrayerKey={nextPrayer?.name}
            asmaText={asma.name.ar}
            asmaKey={asma.index}
          />
          <audio id="azanAudio" src={`${basePath}assets/audio/adan.mp3`} preload="auto"></audio>
        </section>

        {/* Zone 3: Prayer Sidebar (Right) */}
        <aside className="zen-sidebar-right">
          {(() => {
            const rows = [
              { id: 'Imsak', name: 'Imsak' },
              { id: 'Fajr', name: 'Subuh' },
              { id: 'Dhuhr', name: isFriday ? 'Jumat' : 'Dhuhur' },
              { id: 'Asr', name: 'Ashar' },
              { id: 'Maghrib', name: 'Maghrib' },
              { id: 'Isha', name: 'Isya' }
            ];
            // Sholat berikutnya (aktif) & sholat sesudahnya (baris kedua yang di-highlight).
            const activeIdx = rows.findIndex((p) => p.id === nextPrayer?.name);
            const secondIdx = activeIdx >= 0 ? (activeIdx + 1) % rows.length : -1;

            return rows.map((p, i) => {
              const timeStr = (prayerTimes as any)?.[p.id] as string | undefined;
              const isActive = i === activeIdx;
              const isNextUp = i === secondIdx;
              // kind: 'active' (biru berdenyut) | 'next-up' (pink berdenyut) | 'upcoming' (redup) | 'done' (✓).
              let countdown: { text: string; kind: string } | null = null;
              if (timeStr) {
                if (isActive && nextPrayer) {
                  // secondsUntil sudah menangani wraparound tengah malam (mis. Imsak besok).
                  countdown = { text: formatCountdown(nextPrayer.secondsUntil), kind: 'active' };
                } else if (isNextUp) {
                  // Baris kedua: wraparound manual agar tetap hitung mundur meski jamnya "esok".
                  let diff = toSeconds(timeStr) - nowSec;
                  if (diff < 0) diff += 24 * 3600;
                  countdown = { text: formatCountdown(diff), kind: 'next-up' };
                } else {
                  const diff = toSeconds(timeStr) - nowSec;
                  countdown = diff > 0
                    ? { text: formatCountdown(diff), kind: 'upcoming' }
                    : { text: '✓', kind: 'done' };
                }
              }
              // Bilah progres: baris aktif terisi seiring berjalannya selang waktu
              // dari sholat sebelumnya; yang sudah lewat penuh, yang belum kosong.
              let rowFill = 0;
              if (countdown?.kind === 'done') {
                rowFill = 1;
              } else if (countdown?.kind === 'active' && nextPrayer && nextPrayer.totalSeconds > 0) {
                rowFill = 1 - nextPrayer.secondsUntil / nextPrayer.totalSeconds;
              }

              return (
                <div key={p.id} className={`zen-prayer-item ${isActive ? 'active' : ''}`}>
                  <span className="label">{p.name}</span>
                  <div className="time-wrap">
                    <span className="time">{timeStr || '--:--'}</span>
                    {countdown && (
                      <span
                        className={`countdown ${countdown.kind}`}
                        aria-label={countdown.kind === 'done' ? 'Sudah lewat' : `Sisa waktu ${countdown.text}`}
                      >
                        {countdown.text}
                      </span>
                    )}
                  </div>
                  {countdown && (
                    <span className={`row-progress ${countdown.kind}`} aria-hidden="true">
                      <i style={{ width: `${Math.min(Math.max(rowFill, 0), 1) * 100}%` }} />
                    </span>
                  )}
                </div>
              );
            });
          })()}
        </aside>
      </main>

      {/* Overlays & Global Elements (Fixed/Absolute) */}
      <AdzanOverlay
        isAdzan={isAdzanRunning}
        isDoa={isDoaRunning}
        text={runningText}
        clock={`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`}
      />

      {nextPrayer && (
        <FinalCountdown
          secondsLeft={nextPrayer.secondsUntil}
          suppressed={isAdzanRunning}
        />
      )}

      <div className="notification-area">
        <Notification message="📍 Sinkronisasi..." type="location" visible={locationVisible} onHide={handleHideLocationNotification} />
      </div>

      <Calendar />
      <RamadhanMode isActive={isRamadhan} prayerTimes={prayerTimes} coords={coords} />

      <footer className="zen-footer">
        <p>بدر التمام 💞 عملية الصالحة</p>
      </footer>
    </div>
  );
};

export default App;
