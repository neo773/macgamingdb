import type { TailwindConfig } from '@react-email/tailwind';

export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        dark: '#000000',
        gray: {
          light: '#898989',
          medium: '#333333',
          dark: '#272727',
        },
      },
    },
  },
} satisfies TailwindConfig;
