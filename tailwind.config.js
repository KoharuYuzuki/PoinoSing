/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'main':       '#2A2A2A',
        'main-mid':   '#424242',
        'main-light': '#5B5B5B',
        'accent':     '#E2E8F0',
        'theme':      '#75C6C3'
      }
    }
  },
  plugins: []
}
