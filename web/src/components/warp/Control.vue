<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SrcIcon } from '../../stores/Src';
import { WarpBottom_store } from "../../stores/warp/bottom/Bottom";
import { PlayList_store, PlayModel_e } from '../../stores/playList/PlayList';
import MySvg from "../global/MySvg.vue";
import MyBtn from '../global/MyBtn.vue';

const warpBottom_s = WarpBottom_store();

const playlist_s   = PlayList_store();

const {
    playType
} = storeToRefs(playlist_s);
const {
    isShow,
} = storeToRefs(warpBottom_s);

let position = warpBottom_s.enums.position_index;

const playModel_click = () => { playlist_s.playModel_click(); }

const showPosition = (index:number) => {
    warpBottom_s.showPosition(index); 
}


</script>

<template>
    <div class="cmusic_control_btnList_class">
        <!-- 更多按钮 -->
        <MyBtn :checked="(isShow.position_index == position.moreBtn)" 
            :t-icon="SrcIcon.moreBtn_l" 
            :f-icon="SrcIcon.moreBtn_d" 
            @click="showPosition(position.moreBtn)" />
        <!-- 播放循环模式按钮 -->
        <button class="cmusic_control_btn" @click="playModel_click()" title="播放循环模式">
            <MySvg v-show="playType == PlayModel_e.order" :name="SrcIcon.playOrder" />
            <MySvg v-show="playType == PlayModel_e.rand" :name="SrcIcon.playRand" />
            <MySvg v-show="playType == PlayModel_e.only" :name="SrcIcon.playOnly" />
        </button>
        <!-- 歌词按钮 -->
        <MyBtn :checked="(isShow.position_index == position.lyric)"
            :t-icon="SrcIcon.lyric_l"
            :f-icon="SrcIcon.lyric_d"
            @click="showPosition(position.lyric)" />
        <!-- 歌单按钮 -->
        <MyBtn :checked="(isShow.position_index == position.playlist)" 
            :t-icon="SrcIcon.playlist_l"
            :f-icon="SrcIcon.playlist_d"
            @click="showPosition(position.playlist)" />
        <!-- 设置按钮 -->
        <MyBtn :checked="(isShow.position_index == position.setting)"
            :t-icon="SrcIcon.setting_l"
            :f-icon="SrcIcon.setting_d"
            @click="showPosition(position.setting)" />
    </div>
</template>