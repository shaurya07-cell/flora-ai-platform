/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
          soft: 'var(--bg-primary-soft, #EFF6FF)',
        },
        accent: {
          DEFAULT: '#0F766E',
          soft: '#F0FDFA',
        },
        background: 'var(--bg-background, #F8FAFC)',
        surface: 'var(--bg-surface, #FFFFFF)',
        brand: {
          text: 'var(--text-brand-text, #0F172A)',
          secondary: 'var(--text-brand-secondary, #475569)',
          muted: 'var(--text-brand-muted, #64748B)',
          border: 'var(--border-brand-border, #E2E8F0)',
          borderStrong: 'var(--border-brand-border-strong, #CBD5E1)',
        },
        status: {
          success: '#16A34A',
          successSoft: 'var(--bg-success-soft, #F0FDF4)',
          warning: '#D97706',
          warningSoft: 'var(--bg-warning-soft, #FFFBEB)',
          error: '#DC2626',
          errorSoft: 'var(--bg-error-soft, #FEF2F2)',
          info: '#0891B2',
          infoSoft: 'var(--bg-info-soft, #ECFEFF)',
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
