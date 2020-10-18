<template>
  <t-modal :value="true" variant="fullscreen" :disableBodyScroll="true" @closed="close()">
    <template v-slot:header>
      Банкны нэвтрэх нэр нууц үг
    </template>
    <t-alert variant="warning" show :dismissible="false" class="mb-4">
      Энэ мэдээллийг зөвхөн хуулга татахад ашиглана.
    </t-alert>
    <t-input-group
      label="Интернет банкны нэвтрэх нэр"
    >
      <t-input
        v-model="username"
        type="username"
        class="w-full"
      />
    </t-input-group>
    <t-input-group
      label="Интернет банкны нууц үг"
    >
      <t-input
        v-model="password"
        type="password"
        class="w-full"
      />
    </t-input-group>
    <template v-slot:footer>
      <div class="flex justify-end">
        <t-button type="button" @click="close">
          Close
        </t-button>
        <t-button type="button" class="ml-2" @click="save">
          Save
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import constants from '../constants';
import ElectronStore from 'electron-store';
const electronStore = new ElectronStore();

export default {
  name: 'change-bank-credentials',
  data() {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    save() {
      electronStore.set(constants.BANK_USERNAME_KEY, this.username.trim());
      electronStore.set(constants.BANK_PASSWORD_KEY, this.password.trim());

      this.close();
    },
    close() {
      this.$router.go(-1);
    },
  },
  created() {
    this.username = electronStore.get(constants.BANK_USERNAME_KEY, '');
    this.password = electronStore.get(constants.BANK_PASSWORD_KEY, '');
  }
}
</script>

<style>

</style>
