<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Global_store } from '../../stores/Global'
import { Playlist_c } from "../../stores/playList/Lists"
import { PlayList_store } from '../../stores/playList/PlayList'

import songs from "./Songs.vue"
import lists from "./Lists.vue"
import bar from  "./Bar.vue"
import { User_store } from '../../stores/user/User'

const global_s   = Global_store();
const playlist_s = PlayList_store();

const {
    isShow,
    getSelectViewList,
    getShowLists,
    lists_showType,
    songs_enable,
    lists_enable,
} = storeToRefs(playlist_s);

//歌曲修改保存
function songs_save() {
    playlist_s.post_setSongs(playlist_s.getSelectViewList);
}
//歌单项点击事件
function lists_item_click(item:Playlist_c){
    playlist_s.lists_item_click(item);
}
//重新加载歌单
function lists_reload() {
    if (lists_showType.value == 0) {
        playlist_s.load_playList_create();
    } else if (lists_showType.value == 1) {
        playlist_s.load_playList_star();
    }
}
//保存歌单列表的修改
function lists_save() {
    let cplayList = [];
    for (let i = 0, length = playlist_s.getShowLists.length; i < length; ++i) {
        cplayList.push((playlist_s.getShowLists)[i].pid);
    }
    if (playlist_s.lists_showType == 0) {
        playlist_s.post_setCreateLists(cplayList);
    } else if (playlist_s.lists_showType == 1) {
        playlist_s.post_setStarLists(cplayList);
    }
}
function list_beforeAdd(event:any) {
    if(User_store().getUserCid === -1) {
        event.preventDefault();
        global_s.tip("请先登录账号");
    }
}
function lists_items_remove(selectlists:Array<Playlist_c>) {
    for(let i = selectlists.length; i-- > 0;) {
        playlist_s.post_removelist(selectlists[i]);
    }
}
//更新修改lists
function update_lists(in_lists:Array<Playlist_c>) {
    playlist_s.plists[playlist_s.lists_showType] = in_lists;
}

</script>


<template>
    <div class="cmusic_playList" style="height:270px;">
        <bar v-show="isShow.bar"/>
        <!-- 播放列表内容 -->
        <div class="cmusic_displayFlex_class" style="width:100%; overflow: hidden; height: auto;">
            <div v-show="isShow.songs"  class="cmusic_displayFlexColumn_class">
                <span class="cmusic_list_depict" v-show="getSelectViewList.depict">{{getSelectViewList.depict}}</span>
                <!-- 歌曲列表 -->
                    <songs v-model:playlist="playlist_s.selectViewList"
                    :enables="songs_enable"
                    @songs-save="songs_save"/>
            </div>
            <!-- 播放列表的列表 -->
            <lists v-show="isShow.lists" 
                :lists="getShowLists"
                @update:lists="update_lists"
                :enable="lists_enable"
                @item-click="lists_item_click"
                @items-remove="lists_items_remove"
                @list-reload="lists_reload"
                @list-save="lists_save"
                @list-before-add="list_beforeAdd" />
        </div>
    </div>
</template>