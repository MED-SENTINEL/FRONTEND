/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Core Palette - Medical Clean Light
        'sentinel-bg': '#F8FAFC',      // Slate 50
        'sentinel-surface-0': '#FFFFFF', // Pure White
        'sentinel-surface-1': '#F1F5F9', // Slate 100
        'sentinel-surface-2': '#E2E8F0', // Slate 200
        
        // Brand & Accents (Slightly adjusted for light mode contrast)
        'sentinel-optimal': '#0891B2',   // Cyan 700 (Darker for legibility)
        'sentinel-optimal-glow': 'rgba(8, 145, 178, 0.15)',
        'sentinel-accent': '#7C3AED',    // Purple 600
        'sentinel-warning': '#D97706',   // Amber 600
        'sentinel-critical': '#DC2626',  // Red 600
        
        // Typography - Dark for light mode
        'sentinel-text': '#0F172A',      // Slate 900
        'sentinel-muted': '#475569',     // Slate 700
        'sentinel-dim': '#64748B',       // Slate 500
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
