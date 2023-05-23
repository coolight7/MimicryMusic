<script setup lang="ts">
import { ref, onBeforeUnmount, reactive } from "vue";
import { storeToRefs } from 'pinia';
import { Global_store } from '../../stores/Global';
import { Song_c, Song_store } from "../../stores/playList/Song"
import { PopWin_store } from '../../stores/popWin/PopWin';
import { PlayList_Songs_store } from '../../stores/playList/Songs';
import { SrcIcon } from "../../stores/Src";
import ListDetailsVue from "../global/ListDetails.vue";
import MySvg from "../global/MySvg.vue"
import MyBtn from "../global/MyBtn.vue"
import { MySrcInfo_c, MySrc_c, MySrcType_e, MySrcTypeStr_e } from "../../util/MySrc";
import { Url_store } from "../../stores/Url";
import MyImage from "../global/MyImage.vue";
import { Playlist_c } from "../../stores/playList/Lists";

const url_s = Url_store();
const popWin_s   = PopWin_store();
const songs_s    = PlayList_Songs_store();
const global_s   = Global_store();
const song_s = Song_store();

const listDetails = <any>ref(null);

let mValue = reactive({
    list_cache : new Array<Song_c>      //暂存修改前的备份
});

const props = defineProps({
    playlist: {
        type: Playlist_c,
        required: true
    },
    enables:{    //启用功能
        type: Object,
        required:true,
    }
})
//事件信号
const emits = defineEmits({
    'update:playlist'  :null,
    'songs-save'    :null,
    'item-click'    :(event, item, index) => {
        if(event || item || index) {
            return true;
        } else {
            console.warn("Songs.vue: 事件'item-click'所绑定的函数未接收关键参数");
            return true;
        }
    },
})

const {
    getSelectSong,
} = storeToRefs(song_s);

function editSongInfo_click(in_song:Song_c) {
    popWin_s.open_editsong(
        function (re_song:Song_c) {
            for(let key in re_song) {
                in_song[key] = re_song[key];
            }
            listDetails.value.set_isEdit_change(true);
            popWin_s.closeDetail();
        },
        in_song
    );
}

//添加歌曲
function addSong_click() {
    popWin_s.open_addsong(
        function (in_song:Song_c) {
            props.playlist.song.push(in_song);
            listDetails.value.set_isEdit_change(true);
            popWin_s.closeDetail();
            setTimeout(function () {
                listDetails.value.focus_item(props.playlist.song.length - 1);
            }, 500);
    });
}

const songs_item_click = (item:Song_c, index:number) => {
    let event = global_s.getTemp_event();
    emits('item-click', event, item, index);
    if(event.isTodo() == false) {
        return;
    }
    global_s.play_song(props.playlist, item);
}

const removeSong_click = (in_checkedList: Array<number>) => {
    let checkList = in_checkedList;
    let check_len = checkList.length;
    if (check_len == 0) {
        global_s.tip("请先选择歌曲");
        return;
    }
    let nameList = "";
    let songs = props.playlist.song;
    for (let i = check_len; i-- > 0;) {
        nameList += songs[checkList[i]].name + "\n";
    }
    if (confirm("是否确认把以下歌曲从播放列表中移除？\n\n" + nameList)) {
        //确认删除
        //先将checkList存的下标排序(从小到大)
        checkList.sort(function (x, y) {
            if (x < y)
                return -1;
            else if (x > y)
                return 1;
            else
                return 0;
        });
        //从大到小移除歌曲
        for (let i = check_len; i--;) {
            songs.splice(checkList[i], 1);
        }
        checkList.length = 0;
        listDetails.value.set_isEdit_change(true);
    }
}
//修改歌曲的歌词
const selectLyric_click = (in_item:Song_c) => {
    popWin_s.open_selectLyric(
        function(in_lrcid:number) {
            listDetails.value.set_isEdit_change(true);
            in_item.lyric = new MySrc_c<MySrcInfo_c>(
                new MySrcInfo_c(),
                in_lrcid.toString(),
            );
            popWin_s.closeDetail();
        },
        parseInt(in_item.lyric.src)
    );
}

const update_songs = (in_songs:Array<Song_c>) => {
    props.playlist.song = in_songs;
    props.playlist.song_num = in_songs.length;
    emits('update:playlist', props.playlist);
}
const update_songsCache = (in_songs:Array<Song_c>) => {
    mValue.list_cache = new Array<Song_c>();
    in_songs.forEach((value, index, array) => {
        mValue.list_cache.push(value.copyWith());
    });
}
const song_save = () => {
    emits('songs-save');
}
const list_key = (in_item:Song_c) => {
    return in_item.sid;
}
const selected = (in_item:Song_c) => {
    return (getSelectSong.value.sid == in_item.sid);
}

const {
    isShow,
} = storeToRefs(songs_s);

</script>

<template>
    <ListDetailsVue 
        ref="listDetails"
        v-show="isShow.detail"
        :list="props.playlist.song"
        @update:list="update_songs"
        :list-cache="mValue.list_cache"
        @update:list-cache="update_songsCache"
        :enable="props.enables"
        :check-box="true"
        :transform-x="false"
        :list-key="list_key" 
        :selected="selected"
        :focus-shift="-2"
        @item-click="songs_item_click"
        @add-item="addSong_click"
        @remove-item="removeSong_click"
        @list-save="song_save">
        <template #img="{item}">
            <div class="cmusic_playList_thumb" style="margin-right: 10px;">
                <MyImage draggable="false" :src="(<Song_c>item).icon" :err-src="songs_s.default_src.img" alt="歌曲封面" />
            </div>
        </template>
        <template #info="{item}">
            <span class="cmusic_li_name">{{ (<Song_c>item).name }}</span>
            <span class="cmusic_li_artist">{{ (<Song_c>item).artist }}</span>
        </template>
        <template #tags="{item}">
            <span>{{MySrcTypeStr_e.toTag((<Song_c>item).getAudioSrcType())}}</span>
        </template>
        <template #interactButton="{item}">
            <a v-show="MySrcType_e.Bili == (<Song_c>item).getAudioSrcType()" draggable="false" :href="url_s.bili.toBili + (<Song_c>item).getAudioSrc().src" target="_blank"
                class="cmusic_control_btn_noShadow" style="width:40px;height: 40px;display: flex;justify-content: center;align-items: center;">
                <my-svg :name="SrcIcon.bili" />
            </a>
        </template>
        <template #editButton="{item}">
            <!-- 管理按钮 -->
            <div style="display:flex;width: auto;height: auto;">
                <my-btn @click="selectLyric_click((<Song_c>item))" :shadow="false" :icon="SrcIcon.lyric_d" />
                <my-btn @click="editSongInfo_click((<Song_c>item))" :shadow="false" :icon="SrcIcon.edit" />
            </div>
        </template>
    </ListDetailsVue>
</template>