import moment from 'moment-hijri';

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

export const formatHijriDate = (date: Date): string => {
    const hijriDate = (moment(date) as any).subtract(1, 'days').format('iD iMMMM iYYYY');
    return hijriDate.split(' ')
        .map((item: string) => /\d/.test(item) ? toArabicNumerals(item) : item)
        .join(' ');
};
