module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            'device-dark': '#222',
            'device-face': '#2a2a2a',
            'screen-black': '#050505',
            'signal-orange': '#ff6b2b',
            'signal-red': '#ff4444',
            'led-green': '#00ff41'
        },
        fontFamily: {
            'mono': ['"JetBrains Mono"', 'monospace'],
            'sans': ['"Inter"', 'sans-serif']
        }
    },
  },
  plugins: [],
}
