<template>
  <div class="h-screen flex flex-col p-4 space-y-2">
    <span class="dark:text-gray-300">Хуулга татсан түүх</span>
    <t-textarea
      :value="logs"
      autocomplete="false"
      :readonly="true"
      class="flex-1 select-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
    />
  </div>
</template>

<script>
export default {
  name: 'download-log',
  computed: {
    logs() {
      return this.$store.state.logs.slice(0).reverse().join('\n');
    },
  },
};
</script>

<style>

</style>
