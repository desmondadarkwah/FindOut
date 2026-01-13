/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ], theme: {
    extend: {
      fontSize: {
        'xxs': '0.5rem', // This is 8px
        // 'xxxs': '0.375rem', // This is 6px
      },
    },
  },
  plugins: [],
}

