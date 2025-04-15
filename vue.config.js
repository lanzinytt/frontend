const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    liveReload: true,
    client: {
      overlay: true
    }
    // proxy 配置根据需要开启
  }
})