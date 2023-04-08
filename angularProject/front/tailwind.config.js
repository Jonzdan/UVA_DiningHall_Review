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
      },
      gridTemplateColumns: {
        'fluid': 'repeat(4, minmax(220px, 1fr))',
        'fluid-1': 'repeat(3, minmax(220px, 1fr))',
        'fluid-2': 'repeat(2, minmax(220px, 1fr))',
        'fluid-3': 'repeat(1, minmax(220px, 1fr))',
      },
      gridAutoRows: {
        'zero': '0',
      },
      screens: {
        'h-sm': { 'raw' : '(min-height: 450px)'}
        // => @media (min-height: 450px) {}
      }
        
      
    },
  },
  plugins: [
    require("postcss-import"),
    require("tailwindcss"), 
    require("autoprefixer")
  ],
}
