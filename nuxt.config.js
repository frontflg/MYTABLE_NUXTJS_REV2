import colors from 'vuetify/es5/util/colors'

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - nuxt-mytable-app',
    title: 'nuxt-mytable-app',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
      { src: '@/plugins/vue-json-to-csv.js' },
      { src: '@/plugins/day.js' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
    proxy: true
  },

  serverMiddleware: [
  // /api/* ���������邽�߂ɁA�v���W�F�N�g�� api �f�B���N�g������t�@�C����o�^���܂�
    { path: '/api', handler: '~/api/index.js' }
  ],

   // "/update": "http://localhost:5000/",
   // "/delete": "http://localhost:5000/",
   // "/bookupdate": "http://localhost:5000/",
   // "/api": "http://localhost:5000/",
  proxy: {
    "/update": "http://localhost:3000/api/",
    "/delete": "http://localhost:3000/api/",
    "/bookupdate": "http://localhost:3000/api/",
    "/api": "http://localhost:3000/api",
    "/web": "http://localhost:3000"
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      light: true,
      themes: {
        light: {
          background: '#d0f0c0',
          primary: '#00ced1',
          secondary: '#f08080',
          accent: '#9370db',
          warning: '#9c27b0',
          error: '#ef5350'
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    parallel: true,
    cache: true,
    hardSource: true
  }
}
