<script setup lang="ts">
import SearchDetailsVue from '../../components/search/SearchDetails.vue';
import { ContainTopBar_store } from '../../stores/contain/ContainTopBar';

const containTopBar_s = ContainTopBar_store();
containTopBar_s.showPosition(0);

</script>

<template>
    <search-details-vue />
</template>