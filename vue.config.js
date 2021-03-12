const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = {
  configureWebpack: {
    externals: {
      bufferutil: 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
    },
    plugins: [],
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        publish: [{
          provider: 'github',
          releaseType: 'draft',
        }],
        appId: 'com.kono.khan_statement_reporter',
        productName: 'Khan Statement Reporter',
        artifactName: '${productName} Setup ${version}.${ext}',
        afterAllArtifactBuild: './after_build.js',
      },
      chainWebpackMainProcess: (config) => {
        const args = require('yargs/yargs')(process.argv.slice(2)).argv;
        if (args.p === 'always') {
          /// Production build going to get published
          /// Generate source map and upload it to sentry

          config.merge({ devtool: 'source-map' });
          config.plugin('SentryWebpackPlugin').use(SentryWebpackPlugin, [{
            // sentry-cli configuration
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: 'kono-ha',
            project: 'khan-statement-reporter',
            release: `${require('./package.json').name}@${require('./package.json').version}`,
    
            // webpack specific configuration
            include: './dist_electron/bundled/',
            urlPrefix: 'app:///',
          }]);
        }
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
