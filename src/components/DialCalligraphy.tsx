import React from 'react';

// Kaligrafi Asmaul Husna di dalam piringan jam, di belakang jarum.
//
// Sengaja anak .analog-clock, bukan lapisan layar penuh: ukurannya jadi bisa
// diikatkan ke --clock-size sehingga selalu muat di dalam piringan, dan tidak
// terbelah oleh backdrop-filter piringan (yang membuat separuhnya buram dan
// separuhnya tajam saat masih berupa lapisan di belakang).
const DialCalligraphy: React.FC<{ text: string; cycleKey: number }> = ({ text, cycleKey }) => (
    <div className="dial-calligraphy" aria-hidden="true">
        <span key={cycleKey}>{text}</span>
    </div>
);

export default DialCalligraphy;
