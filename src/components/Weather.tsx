import React, { useEffect, useState } from 'react';

interface WeatherProps {
    latitude: number;
    longitude: number;
}

const Weather: React.FC<WeatherProps> = ({ latitude, longitude }) => {
    const [weatherInfo, setWeatherInfo] = useState<string>('');

    const getWeatherInfo = (weatherCode: number) => {
        if (weatherCode >= 1 && weatherCode <= 3) return { desc: "Berawan", icon: "⛅" };
        if (weatherCode >= 45 && weatherCode <= 48) return { desc: "Kabut", icon: "🌫️" };
        if (weatherCode >= 51 && weatherCode <= 67) return { desc: "Gerimis", icon: "🌧️" };
        if (weatherCode >= 71 && weatherCode <= 77) return { desc: "Salju", icon: "❄️" };
        if (weatherCode >= 80 && weatherCode <= 99) return { desc: "Hujan/Badai", icon: "⛈️" };
        return { desc: "Cerah", icon: "☀️" };
    };

    useEffect(() => {
        const fetchWeather = async () => {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
            try {
                const response = await fetch(weatherUrl);
                const data = await response.json();
                if (data.current_weather) {
                    const temp = data.current_weather.temperature;
                    const weatherCode = data.current_weather.weathercode;
                    const weather = getWeatherInfo(weatherCode);
                    setWeatherInfo(`${weather.icon} ${weather.desc} | ${temp}°C`);
                }
            } catch (error) {
                console.error("Gagal mengambil data cuaca:", error);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 1800000); // 30 mins
        return () => clearInterval(interval);
    }, [latitude, longitude]);

    return (
        <div id="weather-info" className="weather-hud">
            {weatherInfo}
        </div>
    );
};

export default Weather;
