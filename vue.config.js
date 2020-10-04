module.exports = {
  configureWebpack: {
    externals: {
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        publish: ['github'],
        appId: 'com.kono.khan_statement_reporter',
        productName: 'Khan Statement Reporter'
      },
      chainWebpackRendererProcess: (config) => {
        config.plugin('html').tap((args) => {
          args[0].title = 'Khan Statement Reporter'
          return args
        })
      },
    }
  }
}
