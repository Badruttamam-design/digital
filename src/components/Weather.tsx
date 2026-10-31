import React, { useEffect, useState } from 'react';
import WeatherIcon from './WeatherIcon';
import type { WeatherKind } from './WeatherIcon';

interface WeatherProps {
    latitude: number;
    longitude: number;
}

interface Level {
    label: string;
    color: string;
}

// Kategori AQI (skala US EPA).
const aqiLevel = (aqi: number): Level => {
    if (aqi <= 50) return { label: "Baik", color: "#4ade80" };
    if (aqi <= 100) return { label: "Sedang", color: "#facc15" };
    if (aqi <= 150) return { label: "Tdk Sehat (Sensitif)", color: "#fb923c" };
    if (aqi <= 200) return { label: "Tidak Sehat", color: "#f87171" };
    if (aqi <= 300) return { label: "Sangat Tdk Sehat", color: "#c084fc" };
    return { label: "Berbahaya", color: "#be123c" };
};

// Kategori indeks UV (WHO).
const uvLevel = (uv: number): Level => {
    if (uv < 3) return { label: "Rendah", color: "#4ade80" };
    if (uv < 6) return { label: "Sedang", color: "#facc15" };
    if (uv < 8) return { label: "Tinggi", color: "#fb923c" };
    if (uv < 11) return { label: "Sangat Tinggi", color: "#f87171" };
    return { label: "Ekstrem", color: "#c084fc" };
};

const Weather: React.FC<WeatherProps> = ({ latitude, longitude }) => {
    const [weatherInfo, setWeatherInfo] = useState<{ kind: WeatherKind; desc: string; temp: number; isDay: boolean } | null>(null);
    const [uv, setUv] = useState<number | null>(null);
    const [aqi, setAqi] = useState<number | null>(null);

    const getWeatherInfo = (weatherCode: number): { desc: string; kind: WeatherKind } => {
        if (weatherCode >= 1 && weatherCode <= 3) return { desc: "Berawan", kind: "partly" };
        if (weatherCode >= 45 && weatherCode <= 48) return { desc: "Kabut", kind: "fog" };
        if (weatherCode >= 51 && weatherCode <= 67) return { desc: "Gerimis", kind: "drizzle" };
        if (weatherCode >= 71 && weatherCode <= 77) return { desc: "Salju", kind: "snow" };
        if (weatherCode >= 80 && weatherCode <= 99) return { desc: "Hujan/Badai", kind: "storm" };
        return { desc: "Cerah", kind: "clear" };
    };

    useEffect(() => {
        const fetchWeather = async () => {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,uv_index,is_day`;
            const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`;

            // Cuaca & kualitas udara diambil terpisah: kalau salah satu gagal, yang lain tetap tampil.
            const [weatherRes, airRes] = await Promise.allSettled([
                fetch(weatherUrl).then(r => r.json()),
                fetch(airUrl).then(r => r.json()),
            ]);

            if (weatherRes.status === 'fulfilled' && weatherRes.value.current) {
                const { temperature_2m, weather_code, uv_index, is_day } = weatherRes.value.current;
                const weather = getWeatherInfo(weather_code);
                setWeatherInfo({ ...weather, temp: temperature_2m, isDay: is_day !== 0 });
                setUv(typeof uv_index === 'number' ? uv_index : null);
            } else if (weatherRes.status === 'rejected') {
                console.error("Gagal mengambil data cuaca:", weatherRes.reason);
            }

            if (airRes.status === 'fulfilled' && typeof airRes.value.current?.us_aqi === 'number') {
                setAqi(airRes.value.current.us_aqi);
            } else if (airRes.status === 'rejected') {
                console.error("Gagal mengambil kualitas udara:", airRes.reason);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 1800000); // 30 mins
        return () => clearInterval(interval);
    }, [latitude, longitude]);

    const uvInfo = uv !== null ? uvLevel(uv) : null;
    const aqiInfo = aqi !== null ? aqiLevel(aqi) : null;

    return (
        <div id="weather-info" className="weather-hud">
            {weatherInfo && (
                <div className="weather-main">
                    <span className="weather-cond">
                        <WeatherIcon kind={weatherInfo.kind} isDay={weatherInfo.isDay} />
                        {weatherInfo.desc}
                    </span>
                    <span className="weather-sep">|</span>
                    <span>{weatherInfo.temp}°C</span>
                </div>
            )}
            {(uvInfo || aqiInfo) && (
                <div className="weather-extra">
                    {uvInfo && (
                        <span className="weather-chip">
                            <i className="weather-dot" style={{ background: uvInfo.color }} />
                            UV {Math.round(uv!)} · {uvInfo.label}
                        </span>
                    )}
                    {aqiInfo && (
                        <span className="weather-chip">
                            {/* Berdenyut pelan mulai kategori "Tidak Sehat" (>150) sebagai peringatan halus. */}
                            <i
                                className={`weather-dot ${aqi! > 150 ? 'pulse' : ''}`}
                                style={{ background: aqiInfo.color, color: aqiInfo.color }}
                            />
                            Udara {aqi} · {aqiInfo.label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default Weather;
