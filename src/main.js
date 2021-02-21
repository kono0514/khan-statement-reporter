import Vue from 'vue';
import './plugins/axios';
import App from './App.vue';
import router from './router';
import store from './store';
import './plugins/auth';
import './assets/tailwind.css';
import VueTailwind from 'vue-tailwind';
import settings from './settings.js';
import * as Sentry from '@sentry/electron';
import VueTippy, { TippyComponent } from 'vue-tippy';
import VEcho from './plugins/echo';
import RoundButton from './components/RoundButton.vue';

Sentry.init({
  dsn: 'https://93e668898a53443d8025ff7f7b56f2d2@o465414.ingest.sentry.io/5478000',
});

Vue.config.productionTip = false;
Vue.use(VueTailwind, settings);

Vue.use(VueTippy, {
  hideOnClick: false,
});
Vue.component('tippy', TippyComponent);

Vue.use(VEcho);

Vue.component('RoundButton', RoundButton);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
