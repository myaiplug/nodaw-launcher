/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00FFFF',
          magenta: '#FF00FF',
          purple: '#8B5CF6',
          dark: '#0A0E17',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        tech: ['Space Mono', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'flicker': 'flicker 4s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '95%': { opacity: '0.4' },
          '96%': { opacity: '1' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 5px theme(colors.cyan.400), 0 0 20px theme(colors.cyan.400)',
        'neon-magenta': '0 0 5px theme(colors.fuchsia.500), 0 0 20px theme(colors.fuchsia.500)',
      },
    },
  },
  plugins: [],
}
