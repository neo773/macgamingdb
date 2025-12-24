import confetti from 'canvas-confetti';

const CONFETTI_COLORS = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1'];

export function triggerConfettiSideCannons() {
  confetti({
    particleCount: 100,
    angle: 60,
    spread: 70,
    startVelocity: 60,
    decay: 0.9,
    gravity: 1,
    ticks: 300,
    origin: { x: 0, y: 0.5 },
    colors: CONFETTI_COLORS,
  });

  confetti({
    particleCount: 100,
    angle: 120,
    spread: 70,
    startVelocity: 60,
    decay: 0.9,
    gravity: 1,
    ticks: 300,
    origin: { x: 1, y: 0.5 },
    colors: CONFETTI_COLORS,
  });
}
