<script setup lang="ts">
import SettingVue from '../../components/setting/Setting.vue';
import { ContainBar_store, MyRouterPostition_e } from '../../stores/contain/ContainBar';

const containbar_s = ContainBar_store();
containbar_s.showPosition(MyRouterPostition_e.Setting);
</script>

<template>
    <setting-vue />
</template>
