export const defaultParticleConfig = {
    particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: ["#00d9ff", "#f70dbc", "#ffeb3b"] },
        shape: { type: "circle" },
        opacity: { value: 0.8, random: true, anim: { enable: true, speed: 1.5, opacity_min: 0.2, sync: false } },
        size: { value: 7, random: true, anim: { enable: true, speed: 1, size_min: 1, sync: false } },
        line_linked: { enable: false },
        move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
    },
    interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: { bubble: { distance: 300, size: 50, duration: 2, opacity: 1, speed: 3 }, push: { particles_nb: 6 } }
    },
    retina_detect: true
};

export const ramadhanParticleConfig = {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: ["#22c55e", "#fbbf24", "#a855f7", "#10b981", "#ffd700"] },
        shape: { type: ["circle", "edge", "triangle", "polygon"], polygon: { nb_sides: 5 } },
        opacity: { value: 0.85, random: true, anim: { enable: true, speed: 1.2, opacity_min: 0.3, sync: false } },
        size: { value: 8, random: true, anim: { enable: true, speed: 1.5, size_min: 2, sync: false } },
        line_linked: { enable: false },
        move: { enable: true, speed: 1.5, direction: "top", random: true, straight: false, out_mode: "out", bounce: false, attract: { enable: true, rotateX: 600, rotateY: 1200 } }
    },
    interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "repulse" }, resize: true },
        modes: { bubble: { distance: 250, size: 60, duration: 2, opacity: 1, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 5 } }
    },
    retina_detect: true
};
