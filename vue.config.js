const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    // client: {
    //   webSocketURL: 'wss://vue.lunerzyphyr.ddns-ip.net/ws'
    // }
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端服务的地址和端口
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 重写路径
        }
      }
    }
  }
})