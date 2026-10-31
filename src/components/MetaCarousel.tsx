import React, { useCallback, useEffect, useRef, useState } from 'react';

// Pembungkus blok info (lokasi, cuaca, langit, ...). Di layar lebar tampil apa
// adanya; di HP CSS mengubahnya jadi carousel geser (scroll-snap) dan titik
// penanda di bawahnya menunjukkan kartu yang sedang terlihat.
const MetaCarousel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ref = useRef<HTMLElement>(null);
    const frame = useRef<number | null>(null);
    const [active, setActive] = useState(0);
    const count = React.Children.toArray(children).length;

    // Kartu aktif = kartu yang titik tengahnya paling dekat dengan tengah scroller.
    const measure = useCallback(() => {
        frame.current = null;
        const el = ref.current;
        if (!el) return;
        const mid = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        Array.from(el.children).forEach((child, i) => {
            const c = child as HTMLElement;
            const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
            if (dist < bestDist) { bestDist = dist; best = i; }
        });
        setActive(best);
    }, []);

    const onScroll = () => {
        if (frame.current === null) frame.current = requestAnimationFrame(measure);
    };

    useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

    const goTo = (i: number) => {
        const el = ref.current;
        const child = el?.children[i] as HTMLElement | undefined;
        if (!el || !child) return;
        el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: 'smooth' });
    };

    return (
        <>
            <header className="zen-meta-top" ref={ref} onScroll={onScroll}>
                {children}
            </header>
            <div className="carousel-dots" role="tablist" aria-label="Kartu info">
                {Array.from({ length: count }, (_, i) => (
                    <button
                        key={i}
                        role="tab"
                        aria-selected={i === active}
                        aria-label={`Kartu ${i + 1}`}
                        className={i === active ? 'on' : ''}
                        onClick={() => goTo(i)}
                    />
                ))}
            </div>
        </>
    );
};

export default MetaCarousel;
