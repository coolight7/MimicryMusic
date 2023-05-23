<script setup lang="ts">
import { ContainBar_store, MyRouterPostition_e } from '../../stores/contain/ContainBar';
import LyricCtrlDetailsVue from '../../components/lyric/LyricCtrlDetails.vue';

const containbar_s = ContainBar_store();
containbar_s.showPosition(MyRouterPostition_e.Lyric);
</script>

<template>
    <LyricCtrlDetailsVue />
</template>