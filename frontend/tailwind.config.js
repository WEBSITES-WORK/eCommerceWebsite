/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Unified Sophisticated Accent (Forest Emerald)
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Core Brand Accent
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Customer Storefront Tokens (Warm Luxury Light Theme)
        store: {
          bg: '#FAFAF9',       // Warm off-white
          card: '#FFFFFF',     // Clean surface
          subtle: '#F5F5F4',   // Soft neutral surface
          border: '#E7E5E4',   // Delicate border
          'border-subtle': '#F5F5F4',
          text: '#0F172A',     // Deep dark primary
          secondary: '#475569',// Charcoal secondary
          muted: '#94A3B8',    // Soft gray
        },
        // Admin Dashboard Tokens (Professional Dark Theme)
        admin: {
          bg: '#0B0D10',       // Dark canvas
          sidebar: '#101318',  // Sidebar surface
          card: '#151922',     // Widget/card surface
          elevated: '#1B2029', // Hover & elevated layers
          border: '#252B35',   // Restrained dark border
          borderLight: '#323B49',
          input: '#12161F',    // Dark input fields
          text: '#F5F7FA',     // High-contrast primary text
          secondary: '#A5ACB8',// Clear secondary text
          muted: '#707887',    // Muted timestamps & labels
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.06)',
        'dark-card': '0 4px 14px 0 rgba(0, 0, 0, 0.35)',
        'dark-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}
