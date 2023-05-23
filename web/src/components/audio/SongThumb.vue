<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Audio_store } from "../../stores/audio/Audio";
import { Song_store } from '../../stores/playList/Song';
import MyImage from '../global/MyImage.vue';

const audio_s = Audio_store();
const song_s = Song_store();

const {
    playing,
} = storeToRefs(audio_s);

const {
    selectSong,
    isable
} = storeToRefs(song_s);

//图片加载错误时使用默认图片替换
</script>


<template>
    <div class="cmusic_info_songThumb">
        <span v-show="isable.songThumb_wave && playing" class="cmusic_img_wave"></span>
        <MyImage :src="selectSong.icon" :err-src="song_s.default_src.img" :class="isable.songThumb_rotate && playing ? 'cmusic_songThumb_rotate' : ''" />
    </div>
</template>