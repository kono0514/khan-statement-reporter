<template>
  <div class="flex flex-col items-center">
    <nav-bar></nav-bar>

    <section class="container mt-4 pb-4 px-4 space-y-4">
      <form class="space-y-4">
        <div class="flex flex-row space-x-4">
          <t-input-group
            label="Email"
            class="flex-1"
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
            class="flex-1"
          >
            <t-input
              v-model="password"
              type="password"
              class="w-full"
              ref="password"
            />
          </t-input-group>
        </div>
        <t-alert variant="danger" :show="authError !== null" :dismissible="false">
          {{ authError }}
        </t-alert>
        <t-button :disabled="loggingIn" @click="doLogin" class="w-full justify-center" :class="{'opacity-25 pointer-events-none cursor-default': loggingIn}">Login</t-button>
      </form>

      <support-links class="flex justify-end space-x-2"></support-links>
    </section>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import SupportLinks from '@/components/SupportLinks.vue';
import { mapState, mapActions } from 'vuex';
import { login } from '@/helpers/auth';

export default {
  name: 'login',
  components: {
    NavBar,
    SupportLinks,
  },
  data() {
    return {
      'email': '',
      'password': '',
      'authError': null,
      'loggingIn': false,
    };
  },
  computed: {
    ...mapState({
      rememberedEmail: state => state.preferences.rememberedEmail,
    }),
  },
  mounted() {
    if (this.email === '') {
      this.$refs.email.focus();
    } else {
      this.$refs.password.focus();
    }
  },
  methods: {
    async doLogin() {
      this.authError = null;
      this.loggingIn = true;
      try {
        await login(this.email, this.password);
        this.start();
      } catch (error) {
        this.authError =
          error.response.data.message ||
          'There was an error logging in to your account.';
      } finally {
        this.loggingIn = false;
      }
    },
    ...mapActions([
      'start',
    ]),
  },
  created() {
    if (this.rememberedEmail && this.rememberedEmail !== '') {
      this.email = this.rememberedEmail;
    }
  },
};
</script>

<style>

</style>
