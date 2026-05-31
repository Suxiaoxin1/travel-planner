/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1890FF',
          light: '#40A9FF',
          dark: '#096DD9',
        },
        background: {
          DEFAULT: '#F5F5F5',
          card: '#FFFFFF',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
          tertiary: '#999999',
        }
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
