export const CONFIG = {
    API: {
        METHOD: 3, // Aladhan calculation method
        LOCATION_THRESHOLD: 500, // meters untuk trigger update lokasi
    },
};

export const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const DAY_NAMES = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const PRAYER_NAMES = ['Imsak', 'Subuh', 'Dhuhur', 'Ashar', 'Maghrib', 'Isya'];

export const ERROR_MESSAGES = {
    PERMISSION_DENIED: "⚠️ Lokasi ditolak - aplikasi tetap berjalan tanpa auto-update",
    POSITION_UNAVAILABLE: "⚠️ Lokasi tidak dapat diambil",
    TIMEOUT: "⚠️ Timeout mengambil lokasi - mencoba lagi...",
    UNKNOWN_ERROR: "⚠️ Terjadi kesalahan yang tidak diketahui",
};
