/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E74C3C',
          black: '#0A0A0A',
          cream: '#F5F0E8',
          yellow: '#FFD93D',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Space Grotesk"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brutal: '6px 6px 0 0 #0A0A0A',
        'brutal-sm': '4px 4px 0 0 #0A0A0A',
        'brutal-lg': '10px 10px 0 0 #0A0A0A',
      },
    },
  },
  plugins: [],
};
