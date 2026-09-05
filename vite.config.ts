import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Tudo que o front pedir em /api e repassado para o backend na 8080.
    // Para o navegador, front e API estao no mesmo endereco — entao nao
    // existe requisicao "cross-origin" e o CORS sai do caminho.
    //
    // Vale so em desenvolvimento. Em producao os dois ficam atras do mesmo
    // dominio, ou o CORS do backend e configurado de verdade.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
