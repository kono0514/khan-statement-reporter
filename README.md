# khan_statement_reporter

<https://mntdonationalert.com>

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn electron:serve
```

### Compiles and minifies for production
```
yarn electron:build
```

### Release
```
SENTRY_AUTH_TOKEN=$SENTRY_TOKEN GH_TOKEN=$GITHUB_TOKEN yarn electron:build:publish
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
