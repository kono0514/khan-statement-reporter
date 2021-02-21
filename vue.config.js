module.exports = {
  configureWebpack: {
    externals: {
      bufferutil: 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
    },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        publish: [{
          provider: 'github',
          releaseType: 'release',
        }],
        appId: 'com.kono.khan_statement_reporter',
        productName: 'Khan Statement Reporter',
        artifactName: '${productName} Setup ${version}.${ext}',
        afterAllArtifactBuild: './after_build.js',
      },
      chainWebpackRendererProcess: (config) => {
        config.plugin('html').tap((args) => {
          args[0].title = `Khan Statement Reporter (${require('./package.json').version})`;
          return args;
        });
      },
    },
  },
};
