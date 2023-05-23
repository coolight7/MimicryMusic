<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Songs from '../../playList/Songs.vue';
import moreBtnVue from "./MoreBtn.vue";
import settingVue from "../../setting/Setting.vue";
import LyricDetailsVue from '../../lyric/LyricDetails.vue';

import { WarpBottom_store } from "../../../stores/warp/bottom/Bottom";
import { PlayList_store } from '../../../stores/playList/PlayList';

const warpBottom_s = WarpBottom_store();
const playlist_s = PlayList_store();

const {
    selectList,
    songs_enable,
} = storeToRefs(playlist_s);

const {
    isShow
} = storeToRefs(warpBottom_s);

function songs_save() {
    playlist_s.post_setSongs(playlist_s.selectList);
}

let position = warpBottom_s.getEnums.position_index;

</script>

<template>
    <div id="cmusic_bottom" v-show="isShow.position_index !== position.empty" style="padding-top: 10px;">
        <more-btn-vue       v-show="isShow.position_index === position.moreBtn" />
        <lyric-details-vue  v-show="isShow.position_index === position.lyric" style="height:100%;"/>
        <Songs v-show="isShow.position_index === position.playlist"  
            v-model:playlist="selectList"
            :enables="songs_enable"
            @songs-save="songs_save" />
        <setting-vue        v-show="isShow.position_index === position.setting" />
    </div>
</template>