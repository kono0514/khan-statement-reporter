import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import ChangeBankCredentials from '../views/ChangeBankCredentials.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      auth: false
    }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      auth: true
    },
    children: [
      {
        path: 'modal',
        name: 'Modal',
        component: ChangeBankCredentials,
      }
    ]
  },
]

const router = new VueRouter({
  routes
})

export default router
