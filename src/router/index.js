import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Config from '@/views/Config.vue'
import UpdateChecker from '@/views/UpdateChecker.vue'
import DownloadLog from '@/views/DownloadLog.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/updater'
  },
  {
    path: '/updater',
    name: 'Updater',
    component: UpdateChecker
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      auth: false
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      auth: true
    },
    children: [
      {
        path: 'config',
        name: 'Config',
        component: Config,
      }
    ]
  },
  {
    path: '/downloadLog',
    name: 'DownloadLog',
    component: DownloadLog,
  }
]

const router = new VueRouter({
  routes,
  mode: 'hash',
})

export default router
