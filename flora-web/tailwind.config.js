/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#EFF6FF',
        },
        accent: {
          DEFAULT: '#0F766E',
          soft: '#F0FDFA',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        brand: {
          text: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          border: '#E2E8F0',
          borderStrong: '#CBD5E1',
        },
        status: {
          success: '#16A34A',
          successSoft: '#F0FDF4',
          warning: '#D97706',
          warningSoft: '#FFFBEB',
          error: '#DC2626',
          errorSoft: '#FEF2F2',
          info: '#0891B2',
          infoSoft: '#ECFEFF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
