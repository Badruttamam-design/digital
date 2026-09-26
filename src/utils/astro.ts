// Perhitungan kecil untuk elemen visual: arah kiblat & fase bulan.

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

// Arah kiblat dalam derajat dari UTARA SEJATI (0-360), rumus lingkaran besar.
export const qiblaBearing = (lat: number, lon: number): number => {
    const phi = toRad(lat);
    const dLon = toRad(KAABA_LON - lon);
    const y = Math.sin(dLon);
    const x = Math.cos(phi) * Math.tan(toRad(KAABA_LAT)) - Math.sin(phi) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

// Nama arah mata angin terdekat, untuk keterangan di bawah kompas.
const COMPASS_16 = [
    'Utara', 'Utara Timur Laut', 'Timur Laut', 'Timur Timur Laut',
    'Timur', 'Timur Menenggara', 'Tenggara', 'Selatan Menenggara',
    'Selatan', 'Selatan Barat Daya', 'Barat Daya', 'Barat Barat Daya',
    'Barat', 'Barat Barat Laut', 'Barat Laut', 'Utara Barat Laut',
];
export const compassName = (bearing: number): string =>
    COMPASS_16[Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16];

// Fase bulan 0..1 (0 = bulan baru, 0.5 = purnama) diperkirakan dari tanggal Hijriah.
// Cukup akurat untuk tampilan: bulan Hijriah memang mengikuti siklus sinodik ~29,53 hari.
export const moonPhaseFromHijriDay = (hijriDay: number): number => {
    const age = ((hijriDay - 1) % 29.53059) / 29.53059;
    return age;
};

export const moonPhaseLabel = (hijriDay: number): string => {
    if (hijriDay <= 2) return 'Hilal';
    if (hijriDay <= 6) return 'Sabit Awal';
    if (hijriDay <= 8) return 'Separuh Awal';
    if (hijriDay <= 13) return 'Cembung Awal';
    if (hijriDay <= 16) return 'Purnama';
    if (hijriDay <= 21) return 'Cembung Akhir';
    if (hijriDay <= 23) return 'Separuh Akhir';
    return 'Sabit Akhir';
};

// Path SVG bagian bulan yang TERANG, berpusat di (0,0) dengan radius r.
// Batas terang-gelap digambar sebagai setengah elips yang menyempit sesuai fase,
// jadi sabit, separuh, cembung, dan purnama semuanya keluar dari satu rumus.
export const moonLitPath = (phase: number, r: number): string => {
    const phi = 2 * Math.PI * phase;
    const cos = Math.cos(phi);
    const rx = Math.abs(cos) * r;
    // phase < 0.5 = membesar → sisi kanan yang terang.
    const sweepOuter = phase < 0.5 ? 1 : 0;
    // Batas menggembung ke sisi terang saat sabit, ke sisi gelap saat cembung.
    const sweepInner = cos > 0 ? 1 - sweepOuter : sweepOuter;
    return [
        `M 0 ${-r}`,
        `A ${r} ${r} 0 0 ${sweepOuter} 0 ${r}`,
        `A ${rx} ${r} 0 0 ${sweepInner} 0 ${-r}`,
        'Z',
    ].join(' ');
};
