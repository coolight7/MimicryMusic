<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Audio_store } from '../../../stores/audio/Audio';
import { PopWin_store } from '../../../stores/popWin/PopWin';
import { SrcIcon } from '../../../stores/Src';

import ProgressVue from '../../global/Progress.vue';
import MyBtn from '../../global/MyBtn.vue';

const popWin_s = PopWin_store();
const audio_s = Audio_store();

const {
    volume,
    speed,
} = storeToRefs(audio_s);

const volume_click      = () => {
    audio_s.volume_click();
}
const volume_shift_click  = (in_shfit:number) => { 
    audio_s.volume_shift(in_shfit);
}
const volume_move = (in_length:number) => {
    let caudio = audio_s.audioPlayer;
    caudio.volume = in_length;
    audio_s.volume_userLast = caudio.volume;
}

const shiftSpeed       = (in_shift:number) => { audio_s.shiftSpeed(in_shift); }
const setSpeed         = (in_speed:number) => { audio_s.setSpeed(in_speed); }

function clocking_click() {
    popWin_s.open_setclocking(
        function() {
            popWin_s.closeDetail();
        }
    );
}

</script>

<template>
    <!-- 更多按钮功能 -->
    <div class="cmusic_moreBtn">
        <!-- 第一按钮栏 -->
        <div class="cmusic_moreBtn_line">
            <!-- 音量按钮 -->
            <my-btn :checked="volume > 0"
                :t-icon="SrcIcon.volume"
                :f-icon="SrcIcon.volume_zero"
                @click="volume_click()" />
            <my-btn :shadow="false"
                :icon="SrcIcon.reduce"
                @click="volume_shift_click(-0.1)"/>
            <!-- 音量条 -->
            <progress-vue :length="volume"
                @mousedown="volume_move"
                @mousemove="volume_move"/>
            <my-btn :shadow="false"
                :icon="SrcIcon.increase"
                @click="volume_shift_click(0.1)" />
        </div>
        <!-- 第二按钮栏 -->
        <div class="cmusic_moreBtn_line">
            <!-- 定时按钮 -->
            <my-btn :icon="SrcIcon.setClocking" 
                @click="clocking_click()" 
                style="margin-right: 25px;" />
            <!-- 减速按钮 -->
            <my-btn :shadow="false" :icon="SrcIcon.reduce" @click="shiftSpeed(-0.25)" />
            <!-- 调速按钮 -->
            <my-btn :icon="SrcIcon.speed" :text="speed.toString()" @click="setSpeed(1)" style="width: 120px;" />
            <!-- 加速按钮 -->
            <my-btn :shadow="false"
                :icon="SrcIcon.increase"
                @click="shiftSpeed(0.25)" />
        </div>
    </div>
</template>