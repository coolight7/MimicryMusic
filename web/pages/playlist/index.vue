<script setup lang="ts">
import PlayListDetailsVue from '../../components/playList/PlayListDetails.vue';
import { ContainBar_store, MyRouterPostition_e } from '../../stores/contain/ContainBar';

const containbar_s = ContainBar_store();
containbar_s.showPosition(MyRouterPostition_e.Playlist);
</script>

<template>
    <play-list-details-vue style="height:500px;"/>
</template>