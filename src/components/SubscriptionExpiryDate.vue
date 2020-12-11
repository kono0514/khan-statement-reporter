<template>
  <t-alert :variant="variant" :show="expiresAt !== null" :dismissible="true" class="mb-3">
    <div>Subscription expires in: <strong>{{ timeRemainingString }}</strong></div>
  </t-alert>
</template>

<script>
const { DateTime } = require('luxon');

export default {
  name: 'subscription-expiry-date',
  data() {
    return {
      expiresAt: null,
    }
  },
  computed: {
    variant() {
      if (this.expiresAt !== null) {
        if (this.expiresAt.diffNow('seconds').seconds <= 0) {
          return 'danger';
        } else if (this.expiresAt.diffNow('days').days <= 3) {
          return 'warning';
        }
      }
      return 'success';
    },
    timeRemainingString() {
      if (this.expiresAt !== null) {
        let humanReadable;
        const expiresInDays = Math.round(this.expiresAt.diffNow('days').days);
        const expiresInHours = Math.round(this.expiresAt.diffNow('hours').hours);
        const expiresInMinutes = Math.round(this.expiresAt.diffNow('minutes').minutes);

        if (Math.abs(expiresInDays) >= 3) {
          humanReadable = `${expiresInDays} day(s)`;
        } else if (Math.abs(expiresInHours) >= 1) {
          humanReadable = `${expiresInHours} hour(s)`;
        } else {
          humanReadable = `${expiresInMinutes} minute(s)`;
        }
        return `${humanReadable} (${this.expiresAt.toFormat('yyyy/LL/dd hh:mm a')})`;
      }
      return '';
    },
  },
  async created() {
    try {
      const response = await this.$axios.get('/api/user/subscription_expiry');
      if (response.data['expires_at'] !== null) {
        this.expiresAt = DateTime.fromISO(response.data['expires_at']);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
</script>

<style>

</style>