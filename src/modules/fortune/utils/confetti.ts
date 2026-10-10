import confetti from 'canvas-confetti'

/** Burst confetti for a legendary wheel win. */
export const fireLegendaryConfetti = () => {
  const defaults = {
    startVelocity: 35,
    spread: 360,
    ticks: 80,
    zIndex: 100,
  }

  void confetti({
    ...defaults,
    particleCount: 60,
    origin: { x: 0.3, y: 0.45 },
  })

  void confetti({
    ...defaults,
    particleCount: 60,
    origin: { x: 0.7, y: 0.45 },
  })
}
