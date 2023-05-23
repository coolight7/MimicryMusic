<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Global_store } from "../../stores/Global"
import { reactive, ref } from "vue"
import { ErrValue_c, Url_store } from '../../stores/Url';
import { AudioLyric_store, LyricItem_c, LyricSrc_c, Lyric_access_e, Lyric_c } from '../../stores/lyric/Lyric';
import LyricEditVue from './LyricEdit.vue';
import CtrlListVue from "./CtrlList.vue";
import BarVue from './Bar.vue';
import { User_store } from '../../stores/user/User';

const user_s = User_store();
const lyric_s = AudioLyric_store();
const global_s = Global_store();
const url_s = Url_store();

const {
    isShow,
    getLyricList
} = storeToRefs(lyric_s);

const editlist = <any>ref(null);

let mValue = reactive({
    selectLrc:new Lyric_c(),
    enable_ctrlList: {
        array: {
            edit: true,
            add: true,       //创建
            order: true,     //排序
            delete: true,    //移除
        },
        item: {
            edit: true,      //编辑
            interact: true,  //互动
        },
    }
});

mValue.selectLrc.name = "歌词"
mValue.selectLrc.lrcid = -1;

const showList = () => {
    isShow.value.edit = false;
    isShow.value.list = true;
}
const showEdit = () => {
    isShow.value.edit = true;
    isShow.value.list = false;
}
const showType_click = () => {
    if(isShow.value.edit == true) {
        showList();
    } else {
        showEdit();
    }
}
const selectLyric_click = (in_item:Lyric_c) => {
    if(in_item.srcAvailable == true) {
        mValue.selectLrc = in_item;
        showEdit();
    } else {
        if(in_item.access == Lyric_access_e.Private 
            && in_item.uid != user_s.getUserCid) {
            global_s.tip("您不可访问这个私密的歌词");
            return;
        }
        lyric_s.load_lyric_src(in_item, false).then(() => {
            mValue.selectLrc = in_item;
            showEdit();
            editlist.value.update_listCache(mValue.selectLrc.src.lrc);
        });
    }
}
const saveLyric = async (in_list:Array<LyricItem_c>) => {
    mValue.selectLrc.src.lrc = in_list;
    const rebool = await lyric_s.post_set_create_src(<Lyric_c>mValue.selectLrc);
    if(true == rebool) {
        global_s.tip("已保存歌词");
    }
}
const item_remove = (in_list:Array<Lyric_c>) => {
    for(let i = in_list.length; i-- > 0;) {
        lyric_s.post_remove_create_lyric(in_list[i]);
    }
}
//保存歌单列表的修改
async function lists_save() {
    let lrcidarr = [];
    for (let i = 0, length = lyric_s.lrcList.length; i < length; ++i) {
        lrcidarr.push((lyric_s.lrcList)[i].lrcid);
    }
    lyric_s.post_order_create(lrcidarr);
}
const lists_reload = () => {
    lyric_s.load_create();
}
function list_beforeAdd(event:any) {
    if(user_s.getUserCid === -1) {
        event.preventDefault();
        global_s.tip("请先登录账号");
    }
}
//更新修改lists
function update_lists(in_lists:Array<Lyric_c>) {
    lyric_s.lrcList = in_lists;
}

</script>

<template>
    <div v-show="isShow.detail" class="cmusic_lyricCtrl" style="height:500px;">
        <BarVue v-show="isShow.bar" :show-point="isShow.edit" :lrc="mValue.selectLrc" @show-type-click="showType_click()" />
        <div class="cmusic_displayFlex_class" style="width:100%;overflow:hidden;height:auto;padding-bottom: 10px;">
            <lyric-edit-vue ref="editlist" 
                v-show="isShow.edit"
                :lrc-obj="<Lyric_c>mValue.selectLrc" 
                @save="saveLyric"
                style="height:100%"/>
            <CtrlListVue v-show="isShow.list" 
                :enables="mValue.enable_ctrlList" 
                :lists="<Array<Lyric_c>>getLyricList" 
                :select-lrcid="mValue.selectLrc.lrcid" 
                @update:lists="update_lists"
                @item-click="selectLyric_click" 
                @items-remove="item_remove"
                @list-reload="lists_reload"
                @list-save="lists_save"
                @list-before-add="list_beforeAdd"
                style="height:100%"/>
        </div>
    </div>
</template>
