<template>
  <t-modal
    :value="true"
    variant="fullscreen"
    :disableBodyScroll="true"
    :hideCloseButton="true"
  >
    <template v-slot:header>
      <div class="flex justify-between items-center">
        <div class="flex space-x-1">
          <svg class="text-gray-700 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="dark:text-gray-100">Configuration</span>
        </div>
        <round-button
          v-tippy
          content="Close"
          @click="close()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </round-button>
      </div>
    </template>
    <div class="flex flex-row space-x-4 mt-1">
      <t-input-group
        label="Интернет банкны нэвтрэх нэр"
        class="flex-1"
      >
        <t-input
          v-model="username"
          type="text"
          class="w-full"
        />
      </t-input-group>
      <t-input-group
        label="Интернет банкны нууц үг"
        class="flex-1"
      >
        <t-input
          v-model="password"
          type="password"
          class="w-full"
        />
      </t-input-group>
    </div>
    <div class="flex items-center space-x-2 mt-2">
      <input type="checkbox" class="form-checkbox transition duration-150 ease-in-out" v-model="nuhujBurtgehEnabled">
      <span class="text-sm" :class="{'opacity-25': !nuhujBurtgehEnabled}">Өмнөх</span>
      <div class="w-16">
        <t-input
          v-model="nuhujBurtgehDays"
          type="number"
          :max="7"
          :min="1"
          :disabled="!nuhujBurtgehEnabled"
          :variant="nuhujBurtgehDays < 1 || nuhujBurtgehDays > 7 ? 'danger' : ''"
        />
      </div>
      <span class="text-sm" :class="{'opacity-25': !nuhujBurtgehEnabled}">
        өдрийн орлогыг Donation Goal-д нөхөж бүртгэх (Alert явахгүй) (1-7)
      </span>
    </div>
    <template v-slot:footer>
      <div class="flex justify-end">
        <t-button type="button" @click="close()">
          Close
        </t-button>
        <t-button type="button" class="ml-2" @click="save()">
          Save
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import constants from '@/constants';
import { mapActions } from 'vuex';
import ElectronStore from 'electron-store';
const electronStore = new ElectronStore();

export default {
  name: 'config',
  data() {
    return {
      username: '',
      password: '',
      nuhujBurtgehEnabled: false,
      nuhujBurtgehDays: 0,
    };
  },
  methods: {
    save() {
      if (this.nuhujBurtgehDays < 1 || this.nuhujBurtgehDays > 7) {
        return;
      }

      electronStore.set(constants.BANK_USERNAME_KEY, this.username.trim());
      electronStore.set(constants.BANK_PASSWORD_KEY, this.password.trim());

      if (this.nuhujBurtgehEnabled !== this.$store.state.recoverMissedAtStart) {
        this.toggleRecoverMissedAtStart();
      }
      this.modifyRecoverMissedDays(this.nuhujBurtgehDays);

      this.close();
    },
    close() {
      this.$router.go(-1);
    },
    ...mapActions(['toggleRecoverMissedAtStart', 'modifyRecoverMissedDays']),
  },
  created() {
    this.username = electronStore.get(constants.BANK_USERNAME_KEY, '');
    this.password = electronStore.get(constants.BANK_PASSWORD_KEY, '');
    this.nuhujBurtgehEnabled = this.$store.state.recoverMissedAtStart;
    this.nuhujBurtgehDays = this.$store.state.recoverMissedDays;
  },
};
</script>

<style>

</style>
