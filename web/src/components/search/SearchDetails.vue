<script setup lang="ts">
import ListsVue from '../playList/Lists.vue';
import UsersVue from '../user/Users.vue';
import SelectLineVue from '../global/SelectLine.vue';

import { storeToRefs }  from 'pinia';
import { useRouter } from 'vue-router';
import { Search_store } from '../../stores/search/Search';
import { Playlist_c } from "../../stores/playList/Lists";
import { PlayList_store } from '../../stores/playList/PlayList';
import { Enable_ListDetails_c } from '../../stores/global/GlobalComp';

const router = useRouter();
const search_s = Search_store();
const playlist_s = PlayList_store();
const {
    isShow,
    showType,
    tipStr,
    type,
    result_lists,
    result_songs,
    result_users,
} = storeToRefs(search_s); 

//歌单项点击事件
const lists_item_click = (item:Playlist_c) => {
    playlist_s.lists_item_click(item, true).then(() => {
        router.push({
            path:'/playlist'
        })
    });
}

const lists_enable = new Enable_ListDetails_c();
lists_enable.array.edit = false;
lists_enable.array.add = false;
lists_enable.array.order = false;
lists_enable.array.delete = false;
lists_enable.array.focus = false;

const search_type_click = (index:number) => { search_s.search_type_click(index) }

</script>

<template>
    <div v-if="isShow.detail" class="cmusic_displayFlexColumn_class">
        <div class="cmusic_displayFlex_class" style="width:auto;margin-bottom: 10px;">
            <select-line-vue text="列表" 
                :selected="type == 1"
                icon="playlist_l"
                @click="search_type_click(1)">
            </select-line-vue>
            <select-line-vue text="歌曲" 
                :selected="type == 2"
                icon="music"
                @click="search_type_click(2)">
            </select-line-vue>
            <select-line-vue text="用户" 
                :selected="type == 3"
                icon="user_d"
                @click="search_type_click(3)">
            </select-line-vue>
        </div>
        <span v-show="showType == 0"
            style="font-weight:bold;margin-left: auto;margin-right: auto;color:#75738e;">请输入内容搜索</span>
        <span v-show="showType == 10"
            style="font-weight:bold;margin-left: auto;margin-right: auto;color:#75738e;">{{tipStr}}</span>
        <!-- 搜索结果栏 -->
        <div class="cmusic_displayFlexColumn_class">
            <lists-vue v-show="showType == 1"
                :lists="result_lists" 
                :enable="lists_enable"
                @item-click="lists_item_click"/>
            <users-vue v-show="showType == 3" 
                :users="result_users"/>
        </div>
    </div>
</template>
