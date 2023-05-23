<script setup lang="ts">
import { SrcIcon } from '../../stores/Src';
import { reactive } from 'vue';
import MyBtn from '../global/MyBtn.vue';
import { storeToRefs } from "pinia";
import { PlayList_store } from '../../stores/playList/PlayList';
import { User_store } from '../../stores/user/User';
import { Playlist_access_e, Playlist_c, PlayList_Lists_store } from "../../stores/playList/Lists";
import { Global_store } from '../../stores/Global';
import { PopWin_store } from '../../stores/popWin/PopWin';
import MySvg from '../global/MySvg.vue';
import MyImage from '../global/MyImage.vue';

const playlist_s = PlayList_store();
const user_s = User_store();
const lists_s = PlayList_Lists_store();
const global_s = Global_store();
const popWin_s = PopWin_store();

const {
    isLogin,
} = storeToRefs(user_s);

const {
    list_favory,
} = storeToRefs(playlist_s);

const emits = defineEmits({
    "onTap": (list:Playlist_c) => {
        if(list) {} else {
            console.warn("PlaylistFavory.vue: 事件'onTap'所绑定的函数未接收关键参数");
        }
        return true;
    },
});

const onTapFun = () => {
    if(true == isLogin.value) {
        emits("onTap", playlist_s.list_favory);
    } else {
        global_s.tip("请登录账号");
    }
}

const onEdit = () => {
    if(true == isLogin.value) {
        popWin_s.open_editlist(function (to_list: Playlist_c) {
        lists_s.post_editlist(to_list, true).then((res: boolean) => {
            if(true == res) {
                for (let key in to_list) {
                    playlist_s.list_favory[key] = to_list[key];
                }
                popWin_s.closeDetail();
            }
            });
        }, playlist_s.list_favory);
    } else {
        global_s.tip("请登录账号");
    }
}

</script>

<template>
    <div class="cmusic_displayFlex_class" 
        style="width: 90%;height: 70px;border-radius: 20px; border: 1px solid #66ccff;align-items: center;padding-left: 20px;padding-right: 20px;">
        <div class="cmusic_playList_thumb" style="margin-right: 10px;">
            <MyImage :src="list_favory.icon" :err-src="lists_s.default_src.img" draggable="false" alt="歌单封面" />
        </div>
        <div class="cmusic_displayFlex_class" style="flex: 1;cursor: pointer;" @click="onTapFun">
            <span class="cmusic_li_name" style="font-weight: bold">我最喜欢的音乐</span>
        </div>
        <div class="cmusic_lists_tag" style="display:flex; justify-content:start;">
            <span class="cmusic_displayFlex_class">
                <MySvg :name="SrcIcon.music" />
                <span class="cmusic_lists_tag_text">{{ list_favory.song_num }}</span>
            </span>
            <span v-if="list_favory.access == Playlist_access_e.Private">私密</span>
            <span v-else-if="list_favory.access == Playlist_access_e.Protected">保护</span>
            <span v-else-if="list_favory.access == Playlist_access_e.Public">公开</span>
        </div>
        <div class="cmusic_displayFlex_class" style="width: 80px;">
            <MyBtn :icon="SrcIcon.edit" @click="onEdit" :shadow="false" />
        </div>
    </div>
</template>