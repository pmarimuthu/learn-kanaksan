// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    // '@nuxtjs/seo',  // re-enable at deploy phase (needs unenv version alignment)
  ],

  // Static Site Generation
  ssr: true,
  nitro: {
    // Vercel deployment: set NITRO_PRESET=vercel or use vercel.json
    // Local dev: node-server (default when preset omitted)
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },

  ui: {
    icons: ['heroicons', 'lucide'],
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  app: {
    head: {
      title: 'Physics Companion — Class 11',
      htmlAttrs: { lang: 'en-IN' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#2f6fd0' },
        {
          name: 'description',
          content:
            'Class 11 Physics made simple — concept first, then formula. Real-world examples, interactive animations, home experiments. NCERT syllabus for Karnataka PU, JEE Main, JEE Advanced, KCET.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            brand: {
              DEFAULT: '#2f6fd0',
              light: '#5a92e0',
              dark: '#1a4fa0',
            },
          },
          fontFamily: {
            sans: ['system-ui', '-apple-system', 'sans-serif'],
          },
        },
      },
    },
  },

  // Use filename-only component names (no folder prefix).
  // e.g. components/Lesson/ConceptBlock.vue → <ConceptBlock>, not <LessonConceptBlock>
  components: [
    { path: '~/components', pathPrefix: false },
  ],

  typescript: {
    strict: true,
    shim: false,
  },

  // Rapier WASM: prevent Vite from pre-bundling — WASM must load at runtime
  vite: {
    optimizeDeps: {
      exclude: ['@dimforge/rapier3d-compat'],
    },
  },

  compatibilityDate: '2024-11-01',
})
