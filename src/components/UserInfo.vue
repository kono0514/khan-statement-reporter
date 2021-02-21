<template>
  <button
    class="relative flex flex-row items-center justify-center self-stretch py-0.5 px-2 bg-indigo-200 dark:bg-indigo-300 text-gray-800 rounded-md focus:outline-none"
    v-tippy
    :content="$auth.user().name + '<br>' + $auth.user().email + '<br>' + expiresAtString"
    @click="updateSubscriptionExpiry()"
  >
    <div v-show="loading" class="absolute inset-0 flex justify-center items-center">
      <svg class="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <img :src="$auth.user().profile_photo_url" class="w-8 h-8 rounded-full bg-primary-light mr-2" :class="{invisible: loading}" />
    <span class="text-xs font-bold" :class="{...colorClass, invisible: loading}">
      <time-ago
        v-if="expiresAt"
        :datetime="expiresAt"
        :interval="10000"
        :with-suffix="false"
      ></time-ago>
    </span>
  </button>
</template>

<script>
const { DateTime } = require('luxon');
import TimeAgo from '@/components/TimeAgo.vue';

export default {
  name: 'user-info',
  components: {
    TimeAgo,
  },
  data() {
    return {
      expiresAt: null,
      loading: false,
    }
  },
  computed: {
    colorClass() {
      if (this.expiresAt !== null) {
        if (this.expiresAt.diffNow('seconds').seconds <= 0) {
          return {'text-red-500': true};
        } else if (this.expiresAt.diffNow('days').days <= 3) {
          return {'text-orange-500': true};
        }
      }
      return {};
    },
    expiresAtString() {
      if (this.expiresAt !== null) {
        return this.expiresAt.toFormat('yyyy/MM/dd HH:mm a');
      }
      return '';
    },
  },
  methods: {
    async updateSubscriptionExpiry() {
      if (this.loading) return;

      this.loading = true;
      try {
        const response = await this.$axios.get('/api/user/subscription_expiry');
        if (response.data['expires_at'] !== null) {
          this.expiresAt = DateTime.fromISO(response.data['expires_at']);
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
  async created() {
    await this.updateSubscriptionExpiry();

    this.$echo.private(`User.${this.$auth.user().id}`)
      .listen('SubscriptionUpdated', (e) => {
        this.loading = true;
        if (e.expires_at) {
          this.expiresAt = DateTime.fromISO(e.expires_at);
        }
        setTimeout(() => {
          this.loading = false
        }, 1000);
      });
  }
}
</script>

<style>

</style>