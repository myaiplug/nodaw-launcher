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
            'signal-cyan': '#06b6d4',
            'signal-red': '#ff4444',
            'led-blue': '#3b82f6'
        },
        fontFamily: {
            'mono': ['"JetBrains Mono"', 'monospace'],
            'sans': ['"Inter"', 'sans-serif']
        }
    },
  },
  plugins: [],
}
