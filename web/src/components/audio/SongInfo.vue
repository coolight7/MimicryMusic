<script setup lang="ts">
import songthumbVue from './SongThumb.vue';
import { storeToRefs } from 'pinia'
import { Audio_store } from "../../stores/audio/Audio";
import { Song_store } from '../../stores/playList/Song';

const audio_s = Audio_store();
const song_s = Song_store();

const {
    isShow,
} = storeToRefs(audio_s);

const {
    selectSong,
} = storeToRefs(song_s);

</script>

<template>
    <!-- 歌曲信息栏 -->
    <div id="cmusic_info" v-show="isShow.info">
        <songthumb-vue />
        <strong class="cmusic_info_songName">{{ selectSong.name }}</strong>
        <span class="cmusic_info_artist">{{ selectSong.artist }}</span>
    </div>
</template>