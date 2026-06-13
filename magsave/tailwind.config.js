/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF6A88',
        'primary-light': '#FF9A9E',
        'primary-dim': '#FFE9EE',
        success: '#16A34A',
        danger: '#E25C3D',
        warning: '#D99A1B',
        bg: '#F7F7F9',
        surface: '#FFFFFF',
        'surface-alt': '#F0F0F0',
        'text-primary': '#1C1C1E',
        'text-secondary': '#8E8E93',
        line: '#ECECF0',
        track: '#E8E8E8',
        input: '#F2F2F6',
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
