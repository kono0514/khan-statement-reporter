import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const EchoPlugin = {};
EchoPlugin.install = function(Vue, options = {}) {
  Vue.prototype.$echo = new Echo({
    broadcaster: 'pusher',
    key: options.key || process.env.VUE_APP_PUSHER_APP_KEY,
    cluster: options.cluster || process.env.VUE_APP_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authorizer: (channel) => {
      return {
        authorize: (socketId, callback) => {
          Vue.axios.post(`${process.env.VUE_APP_URL}/api/broadcasting/auth`, {
            socket_id: socketId,
            channel_name: channel.name,
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
          }).then(response => {
            callback(false, response.data);
          }).catch(error => {
            callback(true, error);
          });
        },
      };
    },
  });
};

export default EchoPlugin;
