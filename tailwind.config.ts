import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Mobile-first breakpoints with custom values for better mobile experience
    screens: {
      'xs': '475px',   // Extra small devices (large phones)
      'sm': '640px',   // Small devices (tablets)
      'md': '768px',   // Medium devices (small laptops)
      'lg': '1024px',  // Large devices (laptops/desktops)
      'xl': '1280px',  // Extra large devices
      '2xl': '1536px', // 2X large devices
      // Mobile-specific breakpoints
      'mobile': {'max': '767px'}, // Target mobile devices only
      'tablet': {'min': '768px', 'max': '1023px'}, // Target tablets only
    },
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdedd5',
          200: '#fbd7aa',
          300: '#f8ba74',
          400: '#f59445',
          500: '#f0864a', // Main brand color
          600: '#e16825',
          700: '#bc4f1b',
          800: '#963f1c',
          900: '#78351a',
          950: '#451f0d', // Extra dark shade for better contrast
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617', // Extra dark shade
        },
        // Mobile-optimized accent colors
        accent: {
          purple: {
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
          },
          blue: {
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
          },
          pink: {
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
          }
        },
        // Better mobile-friendly grays
        neutral: {
          25: '#fcfcfd',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Mobile-first spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        // Mobile-specific spacing
        'mobile-xs': '0.5rem',
        'mobile-sm': '0.75rem',
        'mobile-md': '1rem',
        'mobile-lg': '1.5rem',
        'mobile-xl': '2rem',
      },
      // Mobile-optimized typography
      fontSize: {
        // Mobile-first text sizes
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'mobile-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'mobile-5xl': ['3rem', { lineHeight: '1.2' }],
      },
      // Mobile-optimized shadows
      boxShadow: {
        'mobile-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'mobile': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'mobile-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'mobile-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'mobile-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'floating': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
      // Mobile-optimized border radius
      borderRadius: {
        'mobile': '0.5rem',
        'mobile-md': '0.75rem',
        'mobile-lg': '1rem',
        'mobile-xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        // Mobile-specific animations
        'mobile-bounce': 'mobileBounce 0.6s ease-in-out',
        'mobile-scale': 'mobileScale 0.2s ease-in-out',
        'mobile-shake': 'mobileShake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        // Mobile-specific keyframes
        mobileBounce: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0px)' },
          '40%, 43%': { transform: 'translateY(-15px)' },
          '70%': { transform: 'translateY(-7px)' },
          '90%': { transform: 'translateY(-2px)' },
        },
        mobileScale: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        mobileShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
      // Mobile-optimized z-index scale
      zIndex: {
        'mobile-dropdown': '1000',
        'mobile-sticky': '1010',
        'mobile-modal-backdrop': '1020',
        'mobile-modal': '1030',
        'mobile-toast': '1040',
        'mobile-tooltip': '1050',
      },
      // Mobile-first aspect ratios
      aspectRatio: {
        'mobile-card': '4 / 5',
        'mobile-hero': '16 / 10',
        'mobile-product': '3 / 4',
        'mobile-banner': '2 / 1',
      },
      // Touch-friendly minimum sizes
      minHeight: {
        'touch': '44px',    // iOS minimum touch target
        'touch-android': '48px', // Android minimum touch target
        'mobile-hero': '60vh',
        'mobile-section': '50vh',
      },
      minWidth: {
        'touch': '44px',
        'touch-android': '48px',
      },
      // Mobile-optimized max widths
      maxWidth: {
        'mobile-xs': '20rem',
        'mobile-sm': '24rem',
        'mobile-md': '28rem',
        'mobile-lg': '32rem',
        'mobile-xl': '36rem',
        'mobile-full': '100%',
      },
    },
  },
  plugins: [],
}
export default config 