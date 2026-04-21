/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Greenify palette — cream body, brutalist accents
        cream: '#FDF2E9',
        ink: '#000000',
        yellow: '#FFEB3B',
        red: '#FF5252',
        green: '#69F0AE',
        blue: '#448AFF',
        lavender: '#E8DEF8',
        brand: {
          red: '#FF5252',
          black: '#000000',
          cream: '#FDF2E9',
          yellow: '#FFEB3B',
          green: '#69F0AE',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Archivo Black"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'ui-monospace', 'monospace'],
        sans: ['"DM Sans"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brut: '4px 4px 0 0 #000',
        'brut-sm': '2px 2px 0 0 #000',
        'brut-lg': '6px 6px 0 0 #000',
        'brut-xl': '8px 8px 0 0 #000',
        'brut-2xl': '12px 12px 0 0 #000',
        // aliases for backwards compat with older in-app pages
        brutal: '6px 6px 0 0 #000',
        'brutal-sm': '4px 4px 0 0 #000',
        'brutal-lg': '10px 10px 0 0 #000',
      },
      fontSize: {
        mega: ['clamp(2.25rem, 9vw, 8rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        giga: ['clamp(1.75rem, 6.5vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'sticker-wiggle': 'sticker-wiggle 2.8s ease-in-out infinite',
        'pulse-dot': 'pulse 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-33.333%)' },
        },
        'sticker-wiggle': {
          '0%, 100%': { transform: 'rotate(-8deg)' },
          '50%': { transform: 'rotate(-4deg)' },
        },
      },
    },
  },
  plugins: [],
};
