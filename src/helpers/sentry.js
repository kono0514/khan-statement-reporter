import * as Sentry from '@sentry/electron';
import { Vue as VueIntegration } from '@sentry/integrations';
import store from '../store';

const _init = (options = {}) => {
  Sentry.init({
    dsn: 'https://93e668898a53443d8025ff7f7b56f2d2@o465414.ingest.sentry.io/5478000',
    ...options,
  });
};

const init = () => _init();

const initRenderer = (vue) => _init({
  integrations: [
    new VueIntegration({
      Vue: vue,
      attachProps: true,
      logErrors: true,
    }),
  ],
});

const reportError = (exception, extraTags = {}) => {
  Sentry.captureException(
    exception,
    {
      user: {
        email: store.state.preferences.currentUserEmail,
      },
      tags: extraTags,
    },
  );
};

const reportRetryableError = (exception, extraTags = {}) => {
  reportError(exception, {
    retryable: true,
    ...extraTags,
  });
};

export {
  init,
  initRenderer,
  reportError,
  reportRetryableError,
};
