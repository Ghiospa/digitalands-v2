/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: '#0A0A0A',
                surface: '#111111',
                surface2: '#1A1A1A',
                border: '#222222',
                borderLight: '#2E2E2E',
                accent: '#D4A853',
                'accent-dim': 'rgba(212,168,83,0.08)',
                textPrimary: '#F0F0F0',
                textMuted: '#666666',
                textSubtle: '#3A3A3A',
            },
            fontFamily: {
                serif: ['"Unbounded"', 'system-ui', 'sans-serif'],
                sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                mono: ['"DM Mono"', 'monospace'],
            },
            maxWidth: {
                content: '1100px',
            },
            borderRadius: {
                DEFAULT: '6px',
                sm: '4px',
                md: '8px',
            },
            animation: {
                shimmer: 'shimmer 1.8s ease-in-out infinite',
                fadeUp: 'fadeUp 0.6s ease forwards',
                countUp: 'countUp 0.4s ease',
            },
            keyframes: {
                shimmer: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                fadeUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backgroundImage: {
                'grid-subtle': `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
                'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,168,83,0.04) 0%, transparent 70%)',
            },
            backgroundSize: {
                'grid': '40px 40px',
            },
        },
    },
    plugins: [],
}
