import React, { useEffect, useState } from 'react';
import moment from 'moment-hijri';
import { toSeconds } from '../utils/converter';
import { CONFIG } from '../constants';

interface RamadhanModeProps {
    isActive: boolean;
    prayerTimes: any;
    coords: { lat: number; lon: number } | null;
}

const RamadhanMode: React.FC<RamadhanModeProps> = ({ isActive, prayerTimes, coords }) => {
    const [countdown, setCountdown] = useState<{ label: string; time: string; subtext: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imsakiyahData, setImsakiyahData] = useState<any[]>([]);

    useEffect(() => {
        if (!isActive) return;

        const updateRamadhanData = () => {
            try {
                // Apply -1 day offset to the Hijri date
                // const hijriDate = moment().subtract(1, 'days') as any;
                // const day = hijriDate.iDate();
                // const day = hijriDate.iDate();
                // setDayNumber(day);

                if (prayerTimes && prayerTimes.Imsak && prayerTimes.Maghrib) {
                    const now = new Date();
                    const currentTimeInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
                    const imsakSeconds = toSeconds(prayerTimes.Imsak);
                    const maghribSeconds = toSeconds(prayerTimes.Maghrib);

                    let targetTime, label, subtext;

                    if (currentTimeInSeconds < imsakSeconds) {
                        targetTime = imsakSeconds;
                        label = 'Sahur Berakhir';
                        subtext = 'Segera berhenti makan';
                    } else if (currentTimeInSeconds >= imsakSeconds && currentTimeInSeconds < maghribSeconds) {
                        targetTime = maghribSeconds;
                        label = 'Buka Puasa';
                        subtext = 'Menuju Maghrib';
                    } else {
                        targetTime = imsakSeconds + (24 * 3600);
                        label = 'Sahur Esok';
                        subtext = 'Persiapan besok';
                    }

                    let secondsRemaining = targetTime - currentTimeInSeconds;
                    if (secondsRemaining < 0) secondsRemaining += 24 * 3600;

                    if (secondsRemaining <= 7200 && secondsRemaining > 0) {
                        const hours = Math.floor(secondsRemaining / 3600);
                        const minutes = Math.floor((secondsRemaining % 3600) / 60);
                        const seconds = secondsRemaining % 60;
                        setCountdown({
                            label,
                            time: String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0'),
                            subtext
                        });
                    } else {
                        setCountdown(null);
                    }
                }
            } catch (err) {
                console.error("RamadhanData Error:", err);
            }
        };

        updateRamadhanData();
        const interval = setInterval(updateRamadhanData, 1000);
        return () => clearInterval(interval);
    }, [isActive, prayerTimes]);

    const fetchImsakiyah = async () => {
        if (!coords) return;
        const year = (moment().subtract(1, 'days') as any).iYear();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const apiUrl = "https://api.aladhan.com/v1/hijriCalendar/" + year + "/9?latitude=" + coords.lat + "&longitude=" + coords.lon + "&method=" + CONFIG.API.METHOD + "&timezone=" + timezone + "&adjustment=-1";

        try {
            console.log("Fetching Imsakiyah from:", apiUrl);
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log("Imsakiyah API response:", data);
            if (data.code === 200) {
                setImsakiyahData(data.data);
            }
        } catch (error) {
            console.error('Imsakiyah Error:', error);
        }
    };

    const handleToggleModal = () => {
        if (!isModalOpen) {
            console.log("Opening Imsakiyah Modal, coords:", coords);
            if (imsakiyahData.length === 0 && coords) {
                fetchImsakiyah();
            }
        }
        setIsModalOpen(!isModalOpen);
    };

    if (!isActive) return null;


    return (
        <>
            <button id="imsakiyah-toggle" style={{ display: 'none' }} onClick={handleToggleModal} />

            <div id="ramadhan-countdown" className={!countdown ? 'hidden' : ''}>
                {countdown && (
                    <>
                        <div className="countdown-label">{countdown.label}</div>
                        <div className="countdown-time">{countdown.time}</div>
                        <div className="countdown-subtext">{countdown.subtext}</div>
                    </>
                )}
            </div>


            <div id="imsakiyah-modal" className={`imsakiyah-modal ${!isModalOpen ? 'hidden' : ''}`}>
                <div className="modal-content">
                    <button className="modal-close" onClick={() => setIsModalOpen(false)}>X</button>
                    <h2>Imsakiyah Ramadhan</h2>
                    <div className="imsakiyah-table-container">
                        <table id="imsakiyah-table">
                            <thead>
                                <tr>
                                    <th>Hari</th>
                                    <th>Tanggal</th>
                                    <th>Imsak</th>
                                    <th>Berbuka</th>
                                </tr>
                            </thead>
                            <tbody>
                                {imsakiyahData.map((dayData, i) => (
                                    <tr key={i} className={dayData.date.gregorian.date === moment().format('DD-MM-YYYY') ? 'current-day' : ''}>
                                        <td>{dayData.date.hijri.day}</td>
                                        <td>{dayData.date.gregorian.date}</td>
                                        <td>{dayData.timings.Imsak.split(' ')[0]}</td>
                                        <td>{dayData.timings.Maghrib.split(' ')[0]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RamadhanMode;
