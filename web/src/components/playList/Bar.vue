<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { PlayList_store } from '../../stores/playList/PlayList'
import { SrcIcon } from '../../stores/Src';
import SelectLineVue from '../global/SelectLine.vue';
import MyBtn from '../global/MyBtn.vue';
import MyImage from '../global/MyImage.vue';
import PlaylistFavory from './PlaylistFavory.vue';
import { Playlist_c } from '../../stores/playList/Lists';

const playlist_s = PlayList_store();

const {
    isShow,
    getSelectViewList,
    lists_showType,
} = storeToRefs(playlist_s);


const showType_click = () => { playlist_s.showType_click(); }
const my_click = () => { playlist_s.my_click(); }
const star_click = () => { playlist_s.star_click(); }
const history_click = () => { playlist_s.history_click(); }

//歌单项点击事件
function lists_item_click(item:Playlist_c){
    playlist_s.lists_item_click(item);
}

</script>


<template>
    <!-- 播放列表信息(第一栏) -->
    <div class="cmusic_displayFlexColumn_class">
        <div class="cmusic_displayFlex_class" style="width: auto;height:60px;align-items: center;">
            <!-- 选择列表的显示内容按钮 -->
            <my-btn :checked="isShow.songs" :t-icon="SrcIcon.pointDown_large" :f-icon="SrcIcon.nextPoint" @click="showType_click()" />
            <!-- 选择的歌单信息 -->
            <div class="cmusic_playList_thumb" style="margin-right: 10px;">
                <my-image :src="getSelectViewList.icon" :err-src="playlist_s.default_src.img" />
            </div>
            <div style="display:flex; flex-direction:column; margin-right: 10px;">
                <span style="color:#75738e;font-size:large;font-weight:bold;">{{ getSelectViewList.name }}</span>
                <span v-show="getSelectViewList.pid > 0"
                    style="color:#75738e;font-size:smaller;">{{ getSelectViewList.pid }}</span>
            </div>
        </div>
        <!-- 播放列表显示歌曲时的第二按钮栏 -->
        <div v-show="isShow.songs" class="cmusic_displayFlex_class" style="width:auto;margin-bottom:10px;">
        </div>
        <playlist-favory v-show="isShow.lists" @on-tap="lists_item_click" />
        <!-- 播放列表显示列表时的第二按钮栏 -->
        <div v-show="isShow.lists" class="cmusic_displayFlex_class"
            style="width:auto;margin-bottom:15px">
            <select-line-vue 
                text="我的"
                :selected="lists_showType == 0"
                :t-icon="SrcIcon.plane_l"
                :f-icon="SrcIcon.plane_d"
                @click="my_click()">
            </select-line-vue>
            <select-line-vue 
                text="收藏"
                :selected="lists_showType == 1"
                :t-icon="SrcIcon.star_l"
                :f-icon="SrcIcon.star_d"
                @click="star_click()">
            </select-line-vue>
            <select-line-vue 
                text="历史"
                :selected="lists_showType == 2"
                :t-icon="SrcIcon.history_l"
                :f-icon="SrcIcon.history_d"
                @click="history_click()">
            </select-line-vue>
        </div>
    </div>
</template>