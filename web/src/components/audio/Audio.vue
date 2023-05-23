<script setup lang="ts">
import { Audio_store } from "../../stores/audio/Audio"
import { Song_store } from '../../stores/playList/Song';
import { PlayList_store } from '../../stores/playList/PlayList'; 

import { ref, onMounted } from "vue";

const audio_s       = Audio_store();
const playlist_s    = PlayList_store();

const cmusic_audio = <any>ref(null);

onMounted(() => {
    audio_s.audioPlayer = cmusic_audio;
    audio_s.init(); 
});

let isFirstErr = true;

/*音乐播放结束事件函数*/
const audio_end             = () => { playlist_s.next_click(false); }
const audio_loadStart       = () => { audio_s.audio_loadStart(); }
const audio_canplay         = () => { audio_s.audio_canplay(); }
const audio_loadProgress    = () => { audio_s.audio_loadProgress(); }
const audio_volumeChange    = () => { audio_s.audio_volumeChange(); }
const audio_play            = () => { audio_s.audio_play(); }
const audio_pause           = () => { audio_s.audio_pause(); }
const audio_lengthChange    = () => { audio_s.audio_lengthChange(); }
const audio_speedChange     = () => { audio_s.audio_speedChange(); }
const audio_error           = () => {
    if(isFirstErr) {
        isFirstErr = false;
        return;
    }
    playlist_s.songSrcAvailableShiftItemNum(
        Song_store().selectSong,
        null,
        1,
      );
    playlist_s.next_click(false, true);
}

</script>

<template>
    <div>
        <!-- 音频 -->
        <audio id="cmusic_audio" 
            ref="cmusic_audio" 
            :src="audio_s.audio_src" 
            @ended="audio_end()"
            @canplay="audio_canplay()"
            @timeupdate="audio_lengthChange()" 
            @Loadstart="audio_loadStart()" 
            @progress="audio_loadProgress()"
            @waiting="audio_loadStart()" 
            @play="audio_play()"
            @pause="audio_pause()" 
            @volumechange="audio_volumeChange()" 
            @ratechange="audio_speedChange()"
            @error="audio_error()"
            style="margin-left:auto; margin-right:auto;">
            您的浏览器不支持，请尝试更换浏览器进入！
        </audio>
    </div>
</template>