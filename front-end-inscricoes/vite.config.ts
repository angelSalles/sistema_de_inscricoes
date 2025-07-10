import react from '@vitejs/plugin-react'

export default {
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100, // opcional, define o intervalo de checagem em ms
    },
  },
}
