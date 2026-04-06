import { CONFIG } from '../constants';

export interface PrayerTimings {
    Imsak: string;
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export const fetchPrayerTimes = async (latitude: number, longitude: number): Promise<PrayerTimings> => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const prayerUrl = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${CONFIG.API.METHOD}&timezone=${timezone}`;

    const response = await fetch(prayerUrl);
    const data = await response.json();

    if (data.code === 200) {
        return data.data.timings;
    }
    throw new Error('Failed to fetch prayer times');
};

export const fetchPrayerTimesForDate = async (date: Date, latitude: number, longitude: number): Promise<PrayerTimings> => {
    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    const yearStr = date.getFullYear();
    const dateStr = `${dayStr}-${monthStr}-${yearStr}`;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const prayerUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${CONFIG.API.METHOD}&timezone=${timezone}`;

    const response = await fetch(prayerUrl);
    const data = await response.json();

    if (data.code === 200) {
        return data.data.timings;
    }
    throw new Error('Failed to fetch prayer times for date');
};

export const fetchLocationName = async (latitude: number, longitude: number): Promise<string> => {
    const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

    try {
        const response = await fetch(geocodingUrl);
        const data = await response.json();
        const address = data.address;

        const village = address.village || address.hamlet || '';
        const city = address.city || address.town || address.locality || '';
        const state = address.state || '';

        let locationText = '';
        if (village) locationText += village;
        if (city) locationText += (locationText ? ', ' : '') + city;
        if (state) locationText += (locationText ? ', ' : '') + state;

        return locationText || "Lokasi Terdeteksi";
    } catch (error) {
        console.error("Error fetching location name:", error);
        return `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
    }
};
