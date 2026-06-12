/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7F56D9',
        'primary-light': '#9D71FD',
        'primary-dim': '#2A2342',
        accent: '#47B0FF',
        success: '#22C55E',
        danger: '#F07A50',
        warning: '#F2C14E',
        bg: '#121212',
        surface: '#1E1E24',
        'surface-alt': '#2A2A30',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        line: '#2C2C33',
      },
      borderRadius: {
        card: '24px',
        pill: '14px',
        btn: '10px',
      },
      fontFamily: {
        sans: ['Inter'],
      },
    },
  },
  plugins: [],
};
