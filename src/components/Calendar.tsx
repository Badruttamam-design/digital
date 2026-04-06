import React, { useState } from 'react';
import moment from 'moment-hijri';
import { MONTH_NAMES, DAY_NAMES } from '../constants';
import { formatHijriDate, toArabicNumerals } from '../utils/converter';
import { fetchPrayerTimesForDate } from '../services/prayerService';

const Calendar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [popupData, setPopupData] = useState<any>(null);
    const [loadingPopup, setLoadingPopup] = useState(false);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() - 1);
        setViewDate(d);
    };

    const nextMonth = () => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() + 1);
        setViewDate(d);
    };

    const handleDateClick = async (date: Date) => {
        if (loadingPopup) return;
        setSelectedDate(date);
        setLoadingPopup(true);
        setPopupData(null);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const timings = await fetchPrayerTimesForDate(date, pos.coords.latitude, pos.coords.longitude);
                setPopupData(timings);
            } catch (err) {
                console.error("Popup: Error fetching timings", err);
            } finally {
                setLoadingPopup(false);
            }
        }, () => {
            setLoadingPopup(false);
        });
    };

    const renderDates = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const dates = [];

        for (let i = 0; i < startDay; i++) {
            dates.push(<div key={`empty-${i}`} className="calendar-date other-month" />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const isToday = new Date().toDateString() === date.toDateString();
            const hijriDate = (moment(date).subtract(1, 'days') as any).iDate();

            dates.push(
                <div
                    key={day}
                    className={`calendar-date ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateClick(date)}
                >
                    <div className="date-number">{day}</div>
                    <div className="date-hijri">{toArabicNumerals(hijriDate)}</div>
                </div>
            );
        }

        return dates;
    };

    const hijriMonthYear = (moment(viewDate).subtract(1, 'days') as any).format('iMMMM iYYYY');

    return (
        <>
            <button id="calendar-toggle" style={{ display: 'none' }} onClick={() => setIsOpen(!isOpen)} />

            <div id="mini-calendar" className={`mini-calendar ${!isOpen ? 'hidden' : ''}`}>
                <div className="calendar-header">
                    <button className="calendar-nav-btn" onClick={prevMonth}>‹</button>
                    <div className="calendar-title">
                        <div id="calendar-month-year">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
                        <div className="hijri-month">{hijriMonthYear}</div>
                    </div>
                    <button className="calendar-nav-btn" onClick={nextMonth}>›</button>
                </div>

                <div className="calendar-weekdays">
                    {["AHD", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"].map(d => <div key={d}>{d}</div>)}
                </div>

                <div id="calendar-dates" className="calendar-dates">
                    {renderDates()}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', padding: '5px 15px', borderRadius: '20px', fontSize: '10px', cursor: 'pointer' }}
                    >
                        TUTUP
                    </button>
                </div>
            </div>

            {(selectedDate || loadingPopup) && (
                <div className="prayer-popup" onClick={() => setSelectedDate(null)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <button className="popup-close" onClick={() => setSelectedDate(null)}>✕</button>
                        <div id="popup-date" className="popup-date">
                            {selectedDate ? `${DAY_NAMES[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` : 'Memuat...'}
                        </div>
                        <div id="popup-hijri" className="popup-hijri">
                            {selectedDate ? formatHijriDate(selectedDate) : ''}
                        </div>

                        <div className="prayer-grid">
                            {loadingPopup ? (
                                <div className="popup-loading">Memuat waktu sholat...</div>
                            ) : popupData && (
                                <>
                                    <div className="prayer-time-item"><span>IMSAK</span> <span>{popupData.Imsak.split(' ')[0]}</span></div>
                                    <div className="prayer-time-item"><span>SUBUH</span> <span>{popupData.Fajr.split(' ')[0]}</span></div>
                                    <div className="prayer-time-item">
                                        <span>{selectedDate?.getDay() === 5 ? 'JUMAT' : 'DHUHUR'}</span>
                                        <span>{popupData.Dhuhr.split(' ')[0]}</span>
                                    </div>
                                    <div className="prayer-time-item"><span>ASHAR</span> <span>{popupData.Asr.split(' ')[0]}</span></div>
                                    <div className="prayer-time-item"><span>MAGHRIB</span> <span>{popupData.Maghrib.split(' ')[0]}</span></div>
                                    <div className="prayer-time-item"><span>ISYA</span> <span>{popupData.Isha.split(' ')[0]}</span></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Calendar;
