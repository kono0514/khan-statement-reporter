import Vue from 'vue';
import './plugins/axios';
import router from './router';
import './plugins/auth';
import store from './store';
import './assets/tailwind.css';
import VueTailwind from 'vue-tailwind';
import settings from './settings.js';
import { initRenderer as initSentry } from './helpers/sentry';
import VueTippy, { TippyComponent } from 'vue-tippy';
import VEcho from './plugins/echo';
import RoundButton from './components/RoundButton.vue';
import App from './App.vue';

initSentry(Vue);

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
