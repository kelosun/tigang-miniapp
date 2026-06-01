import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

const getGitHubPagesBase = () => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || ''
  const configuredBasePath = process.env.PAGES_BASE_PATH ?? repositoryName
  const normalizedBasePath = configuredBasePath.replace(/^\/+|\/+$/g, '')

  return normalizedBasePath ? `/${normalizedBasePath}/` : '/'
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? getGitHubPagesBase() : '/',
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  }
})
