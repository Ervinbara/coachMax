/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0C1F',
          card: '#0A0D24',
          sidebar: '#07091a',
          nav: '#10142E',
          border: '#1D2040',
          'border-hover': '#303665',
          text: '#E8E9F5',
          muted: '#7B80A4',
          accent: '#6266F1',
          'accent-hover': '#8B8FFF',
          'accent-bg': '#14183A',
        },
        status: {
          success: '#22C55E',
          'success-bg': '#0A2318',
          'success-border': '#14532D',
          warning: '#F97316',
          'warning-bg': '#2C1A0E',
          'warning-border': '#431A00',
          danger: '#F43F5E',
          'danger-bg': '#2C0E14',
          'danger-border': '#4D0A14',
          neutral: '#8B8FFF',
          'neutral-bg': '#14183A',
          'neutral-border': '#1D2359',
        },
        widget: {
          accent: '#8B8FFF',
          'accent-bg': '#14183A',
          orange: '#F97316',
          'orange-bg': '#2C1A0E',
          success: '#22C55E',
          'success-bg': '#0A2318',
          sky: '#38BDF8',
          'sky-bg': '#0A1E2C',
        },
      },
    },
  },
  plugins: [],
};
