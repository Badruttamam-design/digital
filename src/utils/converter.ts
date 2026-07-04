// Konversi Hijriah memakai kalender Umm al-Qura bawaan browser (Intl / ICU),
// menggantikan dependency moment-hijri.

const DAY_MS = 86_400_000; // milidetik per hari (untuk aritmetika tanggal)

// Offset konvensi Hijriah, dalam HARI:
//   0 = Umm al-Qura / Pemerintah RI (Kemenag)  -> 4 Jul 2026 = 19 Muharram
//   1 = NU (PBNU), mundur 1 hari               -> 4 Jul 2026 = 18 Muharram
// Aplikasi mengikuti penanggalan pemerintah, jadi 0.
const HIJRI_ADJUST_DAYS = 0;

// Formatter di-cache di level modul (pembuatan Intl.DateTimeFormat relatif mahal).
const hijriNumFmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'numeric', year: 'numeric',
});
const hijriMonthNameFmt = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura', {
    month: 'long', // nama bulan aksara Arab (mengikuti tampilan lama moment-hijri)
});

const adjust = (date: Date): Date => new Date(date.getTime() - HIJRI_ADJUST_DAYS * DAY_MS);

export const toArabicNumerals = (num: number | string): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(digit => {
        const d = parseInt(digit);
        return isNaN(d) ? digit : arabicNumerals[d];
    }).join('');
};

export const toSeconds = (timeString: string): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours || 0) * 3600 + (minutes || 0) * 60;
};

// Komponen numerik tanggal Hijriah (bulan 1-12), sesuai konvensi HIJRI_ADJUST_DAYS.
export const hijriParts = (date: Date): { day: number; month: number; year: number } => {
    const parts = hijriNumFmt.formatToParts(adjust(date));
    const get = (t: string) => Number(parts.find(p => p.type === t)!.value);
    return { day: get('day'), month: get('month'), year: get('year') };
};

// Nama bulan Hijriah (aksara Arab).
export const hijriMonthName = (date: Date): string => hijriMonthNameFmt.format(adjust(date));

// Jumlah hari (29/30) dalam bulan Hijriah dari sebuah tanggal.
export const hijriDaysInMonth = (date: Date): number => {
    const p = hijriParts(date);
    const firstDay = new Date(date.getTime() - (p.day - 1) * DAY_MS);
    let n = 28;
    while (hijriParts(new Date(firstDay.getTime() + n * DAY_MS)).month === p.month) n++;
    return n;
};

// Jumlah hari menuju 1 Ramadhan (bulan 9) berikutnya; 0 jika sedang Ramadhan.
export const daysUntilRamadhan = (from: Date = new Date()): number => {
    const probe = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    let n = 0;
    while (hijriParts(probe).month !== 9 && n < 400) {
        probe.setDate(probe.getDate() + 1);
        n++;
    }
    return n;
};

// "١٩ محرم ١٤٤٨" — hari, nama bulan Arab, tahun (angka Arab).
export const formatHijriDate = (date: Date): string => {
    try {
        const { day, year } = hijriParts(date);
        return `${toArabicNumerals(day)} ${hijriMonthName(date)} ${toArabicNumerals(year)}`;
    } catch {
        return '';
    }
};

// "محرم ١٤٤٨" — nama bulan Arab + tahun (angka Arab), untuk header kalender.
export const formatHijriMonthYear = (date: Date): string => {
    try {
        const { year } = hijriParts(date);
        return `${hijriMonthName(date)} ${toArabicNumerals(year)}`;
    } catch {
        return '';
    }
};

const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'] as const;

// Pasaran Jawa (siklus 5 hari). Anchor: 1 Januari 2024 = Pahing (index 1),
// terverifikasi vs 17 Agustus 1945 = Legi & neptu Sabtu Pahing (9+9=18) 4 Jul 2026.
// Pakai UTC agar aman dari timezone.
export const pasaranOf = (date: Date): string => {
    const anchorUtc = Date.UTC(2024, 0, 1);
    const dayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.floor((dayUtc - anchorUtc) / DAY_MS);
    const idx = (((1 + diff) % 5) + 5) % 5;
    return PASARAN[idx];
};
