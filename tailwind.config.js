/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cyberpunk-inspired color palette
        cyber: {
          black: '#0a0a0f',
          darker: '#0d0d14',
          dark: '#12121a',
          surface: '#1a1a24',
          elevated: '#22222e',
          border: '#2a2a3a',
          muted: '#4a4a5e',
        },
        neon: {
          cyan: '#00f0ff',
          'cyan-dim': '#00a0aa',
          magenta: '#ff00aa',
          'magenta-dim': '#aa0077',
          green: '#00ff88',
          'green-dim': '#00aa5c',
          yellow: '#ffcc00',
          orange: '#ff6600',
          red: '#ff3355',
          purple: '#aa55ff',
        },
        // Glassmorphism backgrounds
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.08)',
          heavy: 'rgba(255, 255, 255, 0.12)',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xxs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)',
        'neon-magenta': '0 0 20px rgba(255, 0, 170, 0.3), 0 0 40px rgba(255, 0, 170, 0.1)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'inner-glow': 'inset 0 0 20px rgba(0, 240, 255, 0.1)',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)`,
        'scanline': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'glow-top': 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 240, 255, 0.15), transparent)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
    },
  },
  plugins: [],
};
