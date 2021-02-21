<template>
  <span>{{ timeagoString }}</span>
</template>

<script>
import { luxonDateTimeToRelative } from '@/utils';

export default {
  props: {
    datetime: {
      required: true,
    },
    interval: {
      type: Number,
    },
    withSuffix: {
      type: Boolean,
    },
  },
  data() {
    return {
      timeagoString: '',
    };
  },
  watch: {
    interval() {
      this.stopUpdater();
      this.startUpdater();
    },
    datetime() {
      this.convert();
    },
  },
  methods: {
    startUpdater() {
      this.updater = setInterval(() => {
        this.convert();
      }, this.interval);
    },
    stopUpdater() {
      if (this.updater) {
        clearInterval(this.updater);
        this.updater = null;
      }
    },
    convert() {
      this.timeagoString = luxonDateTimeToRelative(this.datetime, this.withSuffix);
    },
  },
  mounted() {
    this.convert();
    this.startUpdater();
  },
  beforeDestroy() {
    this.stopUpdater();
  },
};
</script>

<style>

</style>
