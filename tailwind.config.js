/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#E1F5EE', 100: '#9FE1CB', 200: '#5DCAA5',
          400: '#1D9E75', 500: '#1D9E75', 600: '#0F6E56',
          700: '#0F6E56', 800: '#085041', 900: '#04342C',
        },
      },
    },
  },
  plugins: [],
}
