<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Audio_store } from '../../stores/audio/Audio'; 

import controlbtn from './ControlBtn.vue';
import progressbar from './ProgressBar.vue';
import songinfo from './SongInfo.vue';

const audio_s = Audio_store();
const {
    isShow
} = storeToRefs(audio_s);

</script>

<template>
    <div v-show="isShow.detail" class="cmusic_displayFlexColumn_class">
        <songinfo />
        <!-- 控制栏 -->
        <div id="cmusic_control">
            <progressbar />
            <controlbtn style="width:auto;margin-bottom: 10px;"/>
        </div>
    </div>
</template>