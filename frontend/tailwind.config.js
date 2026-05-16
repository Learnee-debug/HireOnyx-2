/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── All mutable colors use CSS variables → auto dark mode ── */
        'page-bg':                   'var(--c-bg)',
        'surface-card':              'var(--c-surface)',
        'surface':                   'var(--c-surface)',
        'surface-container-lowest':  'var(--c-s0)',
        'surface-container-low':     'var(--c-s1)',
        'surface-container':         'var(--c-s2)',
        'surface-container-high':    'var(--c-s3)',
        'surface-container-highest': 'var(--c-s4)',
        'surface-elevated':          'var(--c-elevated)',
        'surface-dim':               'var(--c-dim)',
        'border-default':            'var(--c-border)',
        'border-strong':             'var(--c-border-strong)',
        'outline':                   'var(--c-outline)',
        'outline-variant':           'var(--c-outline-var)',
        'text-primary':              'var(--c-text)',
        'text-secondary':            'var(--c-text-muted)',
        'text-muted':                'var(--c-text-subtle)',
        'on-surface':                'var(--c-text)',
        'on-surface-variant':        'var(--c-text-muted)',
        'on-background':             'var(--c-text)',
        'primary':                   'var(--c-primary)',
        'primary-container':         'var(--c-primary-container)',
        'on-primary':                'var(--c-on-primary)',
        'accent-light':              'var(--c-accent-light)',
        'error':                     'var(--c-error)',

        /* ── Score colors — all via CSS vars (auto dark mode) ── */
        'score-high-bg':    'var(--c-score-high-bg)',
        'score-high-text':  'var(--c-score-high-text)',
        'score-mid-bg':     'var(--c-score-mid-bg)',
        'score-mid-text':   'var(--c-score-mid-text)',
        'score-low-bg':     'var(--c-score-low-bg)',
        'score-low-text':   'var(--c-score-low-text)',
        'score-none-bg':    'var(--c-score-none-bg)',
        'score-none-text':  'var(--c-score-none-text)',

        /* ── Static (don't change with theme) ── */
        'accent-hover':            '#1347C5',
        'primary-fixed':           '#dbe1ff',
        'inverse-primary':         '#b5c4ff',
        'on-primary-container':    '#d4dcff',
        'secondary-container':     '#e2dfdd',
        'on-secondary-container':  '#646261',
        'on-secondary':            '#ffffff',
        'tertiary':                '#852b00',
        'on-tertiary':             '#ffffff',
        'tertiary-container':      '#ad3b00',
        'inverse-surface':         '#30312e',
        'inverse-on-surface':      '#f2f1ed',
        'secondary':               '#5f5e5d',
        'background':              '#faf9f5',
        'on-primary-fixed':        '#00174d',
        'surface-bright':          '#faf9f5',
        'surface-tint':            '#1353d8',
        'surface-variant':         '#e3e2df',
        'error-container':         '#ffdad6',
        'on-error-container':      '#93000a',
      },

      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        'display-lg':  ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-base':   ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm':     ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'button-text': ['13px', { lineHeight: '16px', fontWeight: '500' }],
        'data-label':  ['12px', { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '600' }],
        'data-value':  ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-sm':    ['11px', { lineHeight: '14px', letterSpacing: '0.06em', fontWeight: '500' }],
      },

      spacing: {
        'nav-height':   '60px',
        'row-height':   '52px',
        'input-height': '36px',
        'margin-page':  '32px',
        'gutter':       '16px',
      },

      borderRadius: {
        'DEFAULT': '0.25rem',
        'sm':      '0.125rem',
        'md':      '0.375rem',
        'lg':      '0.5rem',
        'xl':      '0.75rem',
        '2xl':     '1rem',
      },

      transitionTimingFunction: {
        'DEFAULT': 'ease',
      },

      transitionDuration: {
        'DEFAULT': '120ms',
      },
    },
  },
  plugins: [],
}
