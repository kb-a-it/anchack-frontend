import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
  ],
  define: {
    // [Design Preview] Vercel 빌드 환경(production | preview | development)을 빌드 시점에
    // 고정한다. Vercel 밖이면 빈 문자열. .env 파일 값보다 우선하므로 수동 설정으로
    // Production에서 디자인 모드를 켤 수 없다(src/common/dev/designPreview.js 참고).
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV ?? ''),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
