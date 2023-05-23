<script setup lang="ts">
import { storeToRefs } from 'pinia'

import audioDetailsVue     from '../audio/AudioDetails.vue';
import controlVue   from "./Control.vue";
import bottomVue    from './bottom/BottomDetails.vue';

import { Style_store } from '../../stores/Style';
import { WarpBottom_store } from "../../stores/warp/bottom/Bottom"
import { ref, onMounted } from "vue";

const {
    cmusic_wrap_div_style
} = storeToRefs(Style_store());

const bottom_s = WarpBottom_store();
const cmusic_warp_div = <any>ref(null);
 
onMounted(() => {
    bottom_s.cmusic_warp_div = cmusic_warp_div;
});

</script>

<template>
    <!-- 播放器本体 -->
    <div id="cmusic_wrap" style="width:100%">
        <div ref="cmusic_warp_div" id="cmusic_wrap_div" :style="cmusic_wrap_div_style">
            <audio-details-vue />
            <control-vue />
            <bottom-vue />
        </div>
    </div>
</template>