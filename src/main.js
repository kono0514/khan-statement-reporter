import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/auth'
import './assets/tailwind.css'
import VueTailwind from 'vue-tailwind'
import settings from './settings.js'

Vue.config.productionTip = false
Vue.use(VueTailwind, settings)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
