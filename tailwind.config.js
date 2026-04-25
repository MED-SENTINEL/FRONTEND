/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Palette - Adaptive (light + dark via CSS)
        'sentinel-bg': '#F8FAFC',
        'sentinel-surface-0': '#FFFFFF',
        'sentinel-surface-1': '#F1F5F9',
        'sentinel-surface-2': '#E2E8F0',
        
        // Dark surfaces
        'sentinel-dark-bg': '#0B0F19',
        'sentinel-dark-surface-0': '#111827',
        'sentinel-dark-surface-1': '#1E293B',
        'sentinel-dark-surface-2': '#334155',
        
        // Brand & Accents
        'sentinel-optimal': '#0891B2',
        'sentinel-optimal-glow': 'rgba(8, 145, 178, 0.15)',
        'sentinel-accent': '#7C3AED',
        'sentinel-warning': '#D97706',
        'sentinel-critical': '#DC2626',
        
        // Typography
        'sentinel-text': '#0F172A',
        'sentinel-muted': '#475569',
        'sentinel-dim': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hud-glow': '0 4px 20px rgba(8, 145, 178, 0.08)',
        'hud-glow-strong': '0 8px 30px rgba(8, 145, 178, 0.12)',
        'accent-glow': '0 4px 20px rgba(124, 58, 237, 0.08)',
      },
      backgroundImage: {
        'hud-gradient': 'linear-gradient(to bottom right, rgba(8, 145, 178, 0.03), rgba(255, 255, 255, 0))',
        'panel-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
      }
    },
  },
  plugins: [],
}
