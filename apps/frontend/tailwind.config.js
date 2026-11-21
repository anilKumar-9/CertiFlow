/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border, 214 20% 89%))',
        input: 'hsl(var(--input, 214 20% 89%))',
        ring: 'hsl(var(--ring, 206 57% 33%))',
        background: 'hsl(var(--background, 210 29% 97%))',
        foreground: 'hsl(var(--foreground, 206 43% 16%))',
        primary: {
          DEFAULT: '#163A5F',
          foreground: '#FFFFFF',
          hover: '#102B47',
        },
        secondary: {
          DEFAULT: '#245B85',
          foreground: '#FFFFFF',
          hover: '#1D4A6D',
        },
        destructive: {
          DEFAULT: '#B91C1C',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#E9EEF3',
          foreground: '#4A5D6E',
        },
        accent: {
          DEFAULT: '#C49A3A',
          foreground: '#172B3A',
        },
        success: {
          DEFAULT: '#0F766E',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#172B3A',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#172B3A',
        },
        // CertiFlow Official Enterprise Brand Palette
        brand: {
          navy: '#163A5F',
          blue: '#245B85',
          gold: '#C49A3A',
          teal: '#0F766E',
          white: '#FFFFFF',
          background: '#F4F7FA',
          border: '#DCE3EA',
          text: '#172B3A',
          subtle: '#E2E8F0',
          dark: '#0C2035',
        },
        status: {
          success: '#0F766E',
          warning: '#C49A3A',
          error: '#B91C1C',
          info: '#245B85',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(22, 58, 95, 0.06), 0 1px 2px -1px rgba(22, 58, 95, 0.04)',
        elevated: '0 4px 6px -1px rgba(22, 58, 95, 0.08), 0 2px 4px -2px rgba(22, 58, 95, 0.05)',
        modal: '0 20px 25px -5px rgba(22, 58, 95, 0.15), 0 8px 10px -6px rgba(22, 58, 95, 0.1)',
      },
    },
  },
  plugins: [],
};
