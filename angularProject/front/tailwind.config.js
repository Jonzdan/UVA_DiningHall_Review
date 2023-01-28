/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      keyframes: {
        colorChange: {
          '100%': { 'background-position': '100% 100%'},
        },
        oppColorChange: {
          '0%': { 'background-position': '100% 100%'},
          '100%': { 'background-position': '0% 0%'}
        }
      },
      animation: {
        bgShift: 'colorChange .6s linear forwards',
        oppBgShift:'oppColorChange .6s linear forwards'
      }
        
      
    },
  },
  plugins: [
    require("postcss-import"),
    require("tailwindcss"), 
    require("autoprefixer")
  ],
}
