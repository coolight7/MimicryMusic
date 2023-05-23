<script setup lang="ts">
import UserDetailsVue from '../../components/user/UserDetails.vue';
import { ContainBar_store } from '../../stores/contain/ContainBar';
const containbar_s = ContainBar_store();
containbar_s.showPosition(3);

</script>

<template>
    <user-details-vue />
</template>
