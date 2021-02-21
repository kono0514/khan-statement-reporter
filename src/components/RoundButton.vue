<template>
  <button
    class="relative p-1.5 rounded-full border-2 border-solid border-transparent focus:ring focus:outline-none"
    :class="[backgroundClasses, colorClasses]"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'round-button',
  props: {
    backgroundClass: String,
    colorClass: String,
  },
  computed: {
    backgroundClasses() {
      if (this.backgroundClass) {
        return this.backgroundClass;
      }
      return 'hover:bg-gray-300 dark:hover:bg-gray-700';
    },
    colorClasses() {
      if (this.colorClass) {
        return this.colorClass;
      }
      return 'text-gray-700 dark:text-gray-400';
    },
  }
}
</script>

<style>

</style>