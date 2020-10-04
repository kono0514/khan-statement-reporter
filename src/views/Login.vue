<template>
  <section class="container mx-auto py-12 px-4">
    <div class="w-full sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12 mx-auto space-y-5">
      <h1 class="text-4xl text-center text-gray-900 dark:text-gray-300 font-semibold">Login</h1>
      <form class="space-y-4">
        <t-input-group
          label="Email"
        >
          <t-input
            v-model="email"
            type="email"
            class="w-full"
            ref="email"
          />
        </t-input-group>
        <t-input-group
          label="Password"
        >
          <t-input
            v-model="password"
            type="password"
            class="w-full"
            ref="password"
          />
        </t-input-group>
        <t-alert variant="danger" :show="authError !== null" :dismissible="false">
          {{ authError }}
        </t-alert>
        <t-button :disabled="loggingIn" @click="login" class="w-full justify-center" :class="{'opacity-25 pointer-events-none cursor-default': loggingIn}">Login</t-button>
      </form>
    </div>
  </section>
</template>

<script>
import ElectronStore from 'electron-store';
const electronStore = new ElectronStore();

export default {
  name: 'login',
  data() {
    return {
      'email': '',
      'password': '',
      'authError': null,
      'loggingIn': false,
    };
  },
  mounted() {
    if (this.email === '') {
      this.$refs.email.focus();
    } else {
      this.$refs.password.focus();
    }
  },
  methods: {
    async login() {
      this.authError = null;
      this.loggingIn = true;
      try {
        await this.$auth.login({
          data: {
            email: this.email,
            password: this.password,
          },
        });
        
        localStorage.setItem('email', this.email);
        this.$store.dispatch('start');
      } catch (error) {
        this.authError =
          error.response.data.message ||
          'There was an error logging in to your account.';
      } finally {
        this.loggingIn = false;
      }
    }
  },
  created() {
    const rememberedEmail = localStorage.getItem('email');
    if (rememberedEmail) {
      this.email = rememberedEmail;
    }

    electronStore.clear();
  }
}
</script>

<style>

</style>