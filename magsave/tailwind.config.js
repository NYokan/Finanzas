/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7C6FF7',
        'primary-dim': '#EEEDFE',
        success: '#1D9E75',
        danger: '#D85A30',
        warning: '#EF9F27',
        bg: '#F7F6F3',
        surface: '#FFFFFF',
        'text-primary': '#1A1A18',
        'text-secondary': '#6B6B67',
        line: '#E8E6E0',
      },
      borderRadius: {
        card: '20px',
        pill: '12px',
        btn: '8px',
      },
    },
  },
  plugins: [],
};
