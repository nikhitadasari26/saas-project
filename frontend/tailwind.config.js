/** @type {import('tailwind.config').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkSidebar: "#0f172a", // Exact dark slate from your image
        glass: 'rgba(255, 255, 255, 0.1)', // For glassmorphism
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}