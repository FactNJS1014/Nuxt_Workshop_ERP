// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  runtimeConfig: {
    public: {
      apiServer: import.meta.env.NUXT_PUBLIC_API_SERVER || 'http://localhost:3001',
      token: import.meta.env.NUXT_PUBLIC_TOKEN || 'token_nuxt_2024_to_2025'
    }
  }
})
