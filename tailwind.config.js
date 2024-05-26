import { nextui } from '@nextui-org/react'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      cursor: {
        pen: 'url(/src/assets/cursors/pen.png), auto',
        picker: 'url(/src/assets/cursors/picker.png), auto',
        eraser: 'url(/src/assets/cursors/eraser.png), auto'
      }
    }
  },
  darkMode: 'class',
  plugins: [nextui()]
}
