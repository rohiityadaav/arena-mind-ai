/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium operations center dark palette
        stadium: {
          bg: '#000000',       // Pure Black
          card: '#FFFFFF',     // Pure White card
          cardLight: '#F8F8F8',// Off-white surface
          accent: '#A3A3A3',   // Metallic neutral gray
          border: '#E5E5E5',   // Silver border for white surfaces
          borderDark: '#262626', // Charcoal border for dark panels
          text: '#111111',     // Charcoal body text
          textLight: '#FFFFFF',// White text
          muted: '#737373'     // Medium gray muted text
        },
        // Semantic operations alerts (subtle, clean status colors)
        ops: {
          safe: '#15803d',      // Emerald Green
          caution: '#b45309',   // Amber Yellow
          alert: '#be123c',     // Rose Red
          critical: '#991b1b'   // Crimson
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'luxury-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'border-glow': '0 0 0 1px rgba(255, 255, 255, 0.15)',
        'border-glow-rose': '0 0 0 2px rgba(225, 29, 72, 0.6)'
      }
    },
  },
  plugins: [],
}
