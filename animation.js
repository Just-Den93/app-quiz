let confettiInterval;

function startConfetti() {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    confettiInterval = setInterval(() => {
        confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: {
                x: Math.random(),
                y: Math.random()
            },
            shapes: ['circle'],
            gravity: 0.5,
            ticks: 300
        });
    }, 500);
}

function stopConfetti() {
    clearInterval(confettiInterval);
}
