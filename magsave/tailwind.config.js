/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7C6FF7',
        'primary-dim': '#2B2650',
        accent: '#8AD8EA',
        success: '#3ECF8E',
        danger: '#F07A50',
        warning: '#F2C14E',
        bg: '#0E0E10',
        surface: '#1A1A1E',
        'text-primary': '#F5F5F4',
        'text-secondary': '#9C9CA3',
        line: '#2A2A30',
      },
      borderRadius: {
        card: '24px',
        pill: '14px',
        btn: '10px',
      },
    },
  },
  plugins: [],
};
