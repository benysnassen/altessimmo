import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FDFCF9', border: '#E8E6E0' },
        sand: { DEFAULT: '#F7F4EE', mid: '#D3D1C7', dark: '#444441' },
        sage: { light: '#E8EFE6', mid: '#C5D9BF', DEFAULT: '#4A6741' },
        lavender: { light: '#EEEDFE', mid: '#CECBF6', DEFAULT: '#3C3489' },
        peach: { light: '#FAECE7', mid: '#F5C4B3', DEFAULT: '#712B13' },
        rose: { light: '#FBEAF0', mid: '#F4C0D1', DEFAULT: '#72243E' },
        danger: { light: '#FCEBEB', mid: '#F7C1C1', DEFAULT: '#E24B4A' },
        success: { light: '#EAF3DE', DEFAULT: '#27500A' },
        warning: { light: '#FAEEDA', DEFAULT: '#633806' },
      },
    },
  },
  plugins: [],
};

export default config;
