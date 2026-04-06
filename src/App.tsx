import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment-hijri';
import AnalogClock from './components/AnalogClock';
import RamadhanMode from './components/RamadhanMode';
import Weather from './components/Weather';
import Calendar from './components/Calendar';
import Notification from './components/Notification';
import { fetchLocationName, fetchPrayerTimes } from './services/prayerService';
import type { PrayerTimings } from './services/prayerService';
import { usePrayerLogic } from './utils/usePrayerLogic';

const App: React.FC = () => {
  const [location, setLocation] = useState<string>('Mendeteksi Lokasi...');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);
  const [isRamadhan, setIsRamadhan] = useState(false);
  const [daysToEid, setDaysToEid] = useState(0);
  const [fastingDay, setFastingDay] = useState(0);
  const [totalFastingDays, setTotalFastingDays] = useState(30);
  const [prevCoords, setPrevCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationVisible, setLocationVisible] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  const { nextPrayer, isAdzanRunning, notification, runningText } = usePrayerLogic(prayerTimes);

  // useEffect(() => {
  //   // Initialize WOW.js
  //   if ((window as any).WOW) {
  //     new (window as any).WOW().init();
  //   }

  //   // Initialize Particles.js
  //   if ((window as any).particlesJS) {
  //     const config = isRamadhan ? ramadhanParticleConfig : defaultParticleConfig;
  //     (window as any).particlesJS('particles-js', config);
  //   }
  // }, [isRamadhan]);

  useEffect(() => {
    // Check if Ramadhan (Hijri month 9, moment-hijri is 0-indexed so iMonth() === 8)
    // Apply -1 day offset to the current date for the check
    const hijriMoment = (moment().subtract(1, 'days') as any);
    const currentHijriMonth = hijriMoment.iMonth();
    const day = hijriMoment.iDate();
    const hijriDaysInMonth = hijriMoment.iDaysInMonth();

    setIsRamadhan(currentHijriMonth === 8);
    setFastingDay(currentHijriMonth === 8 ? day : 0);
    setTotalFastingDays(currentHijriMonth === 8 ? hijriDaysInMonth : 30);
    setDaysToEid(hijriDaysInMonth - day + 1);
  }, []);

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
          if (!prevCoords || Math.abs(prevCoords.lat - latitude) > 0.01 || Math.abs(prevCoords.lon - longitude) > 0.01) {
            setPrevCoords({ lat: latitude, lon: longitude });
            setLocationVisible(true);

            const locName = await fetchLocationName(latitude, longitude);
            setLocation(locName);

            const timings = await fetchPrayerTimes(latitude, longitude);
            setPrayerTimes(timings);
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
  }, [prevCoords]);

  const handleHideLocationNotification = useCallback(() => {
    setLocationVisible(false);
  }, []);

  // clockProps logic moved to JSX to avoid unused variable warning
  const PRAYER_NAMES: Record<string, string> = {
    Imsak: 'Imsak',
    Fajr: 'Subuh',
    Dhuhr: 'Dhuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya',
    Sunrise: 'Terbit' // Just in case
  };

  const nextPrayerDisplay = nextPrayer
    ? `${PRAYER_NAMES[nextPrayer.name] || nextPrayer.name} - ${Math.floor(nextPrayer.secondsUntil / 3600).toString().padStart(2, '0')}:${Math.floor((nextPrayer.secondsUntil % 3600) / 60).toString().padStart(2, '0')}:${(nextPrayer.secondsUntil % 60).toString().padStart(2, '0')}`
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
    <div className={`app-zen-wrapper ${isRamadhan ? 'ramadhan-mode' : ''}`}>
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
            <div className="zen-meta-item">
              <span className="label">Keadaan</span>
              <span className="content">{isAdzanRunning ? 'Sedang Adzan' : 'Menunggu Adzan ' + nextPrayer?.name}</span>
            </div>
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
                  <em>Belum masuk bulan Ramadhan</em>
                )}
              </span>
            </div>
            {isRamadhan && (
              <div className="zen-meta-item">
                <span className="label">Lebaran</span>
                <span className="content">Kurang {daysToEid} Hari Lagi</span>
              </div>
            )}
            {isAdzanRunning && runningText && (
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
            <button
              className="zen-icon-btn"
              onClick={() => document.getElementById('imsakiyah-toggle')?.click()}
              title="Imsakiyah"
            >
              📖
            </button>
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
          />
          <audio id="azanAudio" src="/assets/audio/adan.mp3" preload="auto"></audio>
        </section>

        {/* Zone 3: Prayer Sidebar (Right) */}
        <aside className="zen-sidebar-right">
          {[
            { id: 'Imsak', name: 'Imsak' },
            { id: 'Fajr', name: 'Subuh' },
            { id: 'Dhuhr', name: 'Dhuhur' },
            { id: 'Asr', name: 'Ashar' },
            { id: 'Maghrib', name: 'Maghrib' },
            { id: 'Isha', name: 'Isya' }
          ].map((p) => (
            <div key={p.id} className={`zen-prayer-item ${nextPrayer?.name === p.id ? 'active' : ''}`}>
              <span className="label">{p.name}</span>
              <span className="time">{(prayerTimes as any)?.[p.id] || '--:--'}</span>
            </div>
          ))}
        </aside>
      </main>

      {/* Overlays & Global Elements (Fixed/Absolute) */}
      <div className="notification-area">
        <Notification message={notification?.message || ""} type="info" visible={!!notification} />
        <Notification message="📍 Sinkronisasi..." type="location" visible={locationVisible} onHide={handleHideLocationNotification} />
      </div>

      <Calendar />
      <RamadhanMode isActive={isRamadhan} prayerTimes={prayerTimes} coords={coords} />

      <footer className="zen-footer">
        <p>بدر التمام إبن علي</p>
      </footer>

      <div id="particles-js"></div>
    </div>
  );
};

export default App;
