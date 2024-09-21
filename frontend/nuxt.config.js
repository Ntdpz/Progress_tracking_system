import colors from "vuetify/es5/util/colors";
const path = require("path");

export default {
  router: {
    middleware: ["loader"],
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Progress-Tracking',
    title: "Progress-Tracking",
    htmlAttrs: {
      lang: "en",
    },
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
    ],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  target: "static",
  buildModules: ["@nuxt/image"],
  image: {
    // Options
  },
  // ssr: false,
  // target: "static",
  // server: {
  //   //port:80, //in server
  //   port: 3000,
  //   host: "0.0.0.0",
  // },
  // router: {
  //   base: "/notemanagement/",
  // },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@fortawesome/fontawesome-free/css/all.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["@/plugins/chart.js"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify",
    "@nuxtjs/google-fonts",
  ],

  googleFonts: {
    families: {
      Lato: true,
      Montserrat: true,
      Oxygen: true,
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    "@nuxtjs/auth",
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: `http://localhost:7777`,
    // proxy: true,
  },

  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: "/auth/api/login",
            method: "post",
            propertyName: "token",
          },
          user: { url: "/auth/api/me", method: "get", propertyName: "user" },
          logout: false,
        },
      },
      redirect: {
        login: "/login", // Redirect to the login page when not authenticated
      },
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: "#009933",
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
        light: {
          primary: "#009933",
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, { isDev, isClient }) {
      config.resolve.alias["@components"] = path.resolve(
        __dirname,
        "components"
      );
      
    },
  },
};
