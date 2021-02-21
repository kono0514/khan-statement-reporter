'use strict';

import Vue             from 'vue';
import auth            from '@websanova/vue-auth';
import httpAxios       from '@websanova/vue-auth/dist/drivers/http/axios.1.x.esm.js';
import routerVueRouter from '@websanova/vue-auth/dist/drivers/router/vue-router.2.x.esm.js';
import router          from '../router';

Vue.router = router;
Vue.use(auth, {
  auth: {
    request: function(req, token) {
      if (req.ignoreInterceptors === true) return;
  
      this.http.setHeaders.call(this, req, {
        Authorization: 'Bearer ' + token,
      });
    },
    
    response: function(res) {
      if (res.config.ignoreInterceptors === true) return;
  
      var data = this.http.httpData.call(this, res);
  
      if (data.access_token) {
        return data.access_token;
      }
    },
  },
  http: httpAxios,
  router: routerVueRouter,
  tokenDefaultKey: 'access_token',
  fetchData: {
    url: '/api/user',
    enabled: true,
  },
  parseUserData: (data) => {
    return data || {};
  },
  loginData: {
    url: '/api/sanctum/token',
    redirect: '/home',
    fetchUser: true,
  },
  logoutData: {
    makeRequest: false,
    redirect: '/login',
  },
  refreshData: {
    enabled: false,
  },
});

export default {};
