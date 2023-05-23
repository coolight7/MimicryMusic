<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Song_store } from '../../stores/playList/Song';
import { Audio_store } from "../../stores/audio/Audio";
import { PlayList_store } from "../../stores/playList/PlayList"
import { SrcIcon } from "../../stores/Src"
import MyBtn from "../global/MyBtn.vue"

const song_s = Song_store();
const audio_s = Audio_store();

const {
    getSelectSong,
} = storeToRefs(song_s);

const {
    isShow,
    playing,
    canPlay,
} = storeToRefs(audio_s);
const play_click = () => { audio_s.play_click(); }

const playlist_s = PlayList_store();
const next_click = (click_bool:boolean) => { playlist_s.next_click(click_bool); }
const prev_click = () => { playlist_s.prev_click(); }

</script>

<template>
    <div v-show="isShow.controlBtn" class="cmusic_displayFlex_class cwin_center">
        <!-- 上一曲按钮 -->
        <MyBtn :f-icon="SrcIcon.previousPoint"  @click="prev_click()"/>
        <!-- 暂停/播放按钮 加载动画 -->
        <div style="display:inline-block; position: relative;">
            <span v-show="!canPlay && getSelectSong.tryGetAudioSrc()?.src" class="loader-5"></span>
            <MyBtn :checked="playing"  t-icon="stopMedia" f-icon="playMedia" @click="play_click()" style="border-radius:50%;z-index: 1;" />
        </div>
        <!-- 下一曲按钮 -->
        <MyBtn :f-icon="SrcIcon.nextPoint" @click="next_click(true)" />
    </div>
</template>