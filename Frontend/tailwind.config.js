export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cold-white': '#f0f8ff',
        'deep-space-blue': '#05080d',
        'glitch-red': '#ff003c',
        'holographic-gold': '#ffd700',
        'neon-cyan': '#00f3ff',
        'plasma-purple': '#9945ff',
        'matrix-green': '#00ff41',
        'stable': '#39ff14',
        'high-entropy': '#ff003c',
        'locked': '#2a2a2a',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Consolas"', 'monospace'],
        sans: ['"Inter"', '"Roboto"', 'sans-serif'],
        display: ['"Orbitron"', '"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
