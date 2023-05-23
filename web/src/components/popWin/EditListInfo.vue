<script setup lang="ts">
import { Global_store } from "../../stores/Global"
import { reactive } from "vue";
import { storeToRefs } from 'pinia';
import { Src_store } from "../../stores/Src";
import { Playlist_c, Playlist_access_e, PlayList_Lists_store } from '../../stores/playList/Lists';
import SelectFileImageVue from "../global/SelectFileImage.vue";
import InputRegexVue from "../global/InputRegex.vue";
import SelectLineVue from '../global/SelectLine.vue';
import PopWinBase from "./PopWinBase.vue";
import { MySrcInfo_c, MySrcType_e, MySrc_c } from "../../util/MySrc";

const src_s     = Src_store();
const global_s  = Global_store();
const list_s    = PlayList_Lists_store();

const {
    regex
} = storeToRefs(list_s);

const props = defineProps({
    list:{
        type:Playlist_c,
        required:true
    }
})

const emits = defineEmits({
    'save':(list:Playlist_c) => {
        if(list) {
            return true;
        } else {
            console.log("AddList.vue: 事件 'add' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    "cancle":null
})

let mValue = reactive({
    list:props.list.copyWith(),
})

function update_icon(data:string) {
    mValue.list.icon = new MySrc_c(new MySrcInfo_c(MySrcType_e.LocalCache), data);
}

const confirm_click = async () => {
    if (!regex.value.name.test(mValue.list.name)) {
        global_s.tip("歌单名 格式错误");
        return;
    }
    if(!regex.value.depict.test(mValue.list.depict)) {
        global_s.tip("描述信息 格式错误");
        return;
    }
    if (mValue.list.access == Playlist_access_e.Protected && !regex.value.passwd.test(mValue.list.passwd)) {
        global_s.tip("访问密码 格式错误");
        return;
    }
    if(mValue.list.icon.src.length > 0) {
        const resrc = await src_s.tryDataURLUpload(mValue.list.icon.src, true)
        if(null != resrc) {
            mValue.list.icon = resrc;
            emits('save', mValue.list);
        }
    } else {
        emits('save', mValue.list);
    }
}
const cancle_click = () => {
    emits('cancle');
}

const btnlist = [
    {
        isShow: true,
        str: "修改",
        fun: confirm_click
    },
    {
        isShow: true,
        str: "取消",
        fun: cancle_click
    }
]

</script>

<template>
    <PopWinBase title="修改歌单信息" :f-btns="btnlist">
        <div class="cwin_displayFlex cwin_center">
            <SelectFileImageVue :src="mValue.list.icon" @change="update_icon" class="cwin_content_img" :err-src="list_s.default_src.img" />
            <div class="cwin_displayFlexColumn cwin_info_input">
                <span class="cwin_center" style="margin-bottom:10px;font-size:15px;color:#75738e;">PID:{{mValue.list.pid}}</span>
                <InputRegexVue v-model:str="mValue.list.name" :regex="regex.name" placeholder="歌单名" />
                <textarea v-model="mValue.list.depict" placeholder="描述" class="cmusic_textarea" style="width:70%; height:60px; margin-left: auto;margin-right: auto;"></textarea>
            </div>
        </div>
        <div class="cwin_displayFlexColumn" style="height: 200px;">
            <div class="cmusic_displayFlex_class">
                <select-line-vue text="公开" :selected="mValue.list.access == Playlist_access_e.Public" @click="mValue.list.access = Playlist_access_e.Public" />
                <select-line-vue text="设置密码" :selected="mValue.list.access == Playlist_access_e.Protected" @click="mValue.list.access = Playlist_access_e.Protected" />
                <select-line-vue text="仅自己可见" :selected="mValue.list.access == Playlist_access_e.Private" @click="mValue.list.access = Playlist_access_e.Private" />
            </div>
            <div class="cwin_displayFlexColumn" style="height:60px">
                <span v-show="mValue.list.access == Playlist_access_e.Public" class="cwin_tipSpan">所有人都可以访问歌单</span>
                <span v-show="mValue.list.access == Playlist_access_e.Protected" class="cwin_tipSpan">他人访问歌单时需要验证密码</span>
                <span v-show="mValue.list.access == Playlist_access_e.Private" class="cwin_tipSpan">只有自己可以访问歌单</span>
            </div>
            <div v-show="mValue.list.access == Playlist_access_e.Protected" class="cwin_center">
                <InputRegexVue v-model:str="mValue.list.passwd" :regex="regex.passwd" placeholder="访问密码" />
            </div>
        </div>
    </PopWinBase>
</template>