<script setup lang="ts">
import { Global_store } from "../../stores/Global"
import { reactive } from "vue";
import { Lyric_c, Lyric_access_e, Lyric_copyright_e, AudioLyric_store } from '../../stores/lyric/Lyric';
import { storeToRefs } from "pinia";
import InputRegexVue from "../global/InputRegex.vue";
import PopWinBase from "./PopWinBase.vue";
import SelectLineVue from '../global/SelectLine.vue';

const lyric_s = AudioLyric_store();

const {
    regex
} = storeToRefs(lyric_s);

const props = defineProps({
    lyric:{
        type:Object,
        required:true
    }
})

const emits = defineEmits({
    'save':(in_lyric:Lyric_c) => {
        if(in_lyric) {
            return true;
        } else {
            console.log("EditLyric.vue: 事件 'save' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    "cancle":null
})

const global_s = Global_store();

let mValue = reactive({
    lyric:props.lyric.copyWith(),
});

const saveList_click = () => {
    if (!regex.value.name.test(mValue.lyric.name)) {
        global_s.tip("歌词名称 格式错误");
        return;
    }
    if(!regex.value.artist.test(mValue.lyric.artist)) {
        global_s.tip("艺术家 格式错误");
        return;
    }
    if(!regex.value.depict.test(mValue.lyric.depict)) {
        global_s.tip("描述信息 格式错误");
        return;
    }
    emits('save', <Lyric_c>mValue.lyric);
}

const cancle_click = () => {
    emits('cancle');
}
const btnlist = [
    {
        isShow: true,
        str: "修改",
        fun: saveList_click
    },
    {
        isShow: true,
        str: "取消",
        fun: cancle_click
    }
]
</script>

<template>
    <PopWinBase title="修改歌词" :f-btns="btnlist">
        <div class="cwin_displayFlexColumn">
            <div class="cwin_displayFlex cwin_center">
                <div class="cwin_displayFlexColumn cwin_info_input" style="margin-left: 0px;">
                    <InputRegexVue v-model:str="mValue.lyric.name" :regex="regex.name" placeholder="歌词名称" />
                    <InputRegexVue v-model:str="mValue.lyric.artist" :regex="regex.artist" placeholder="艺术家" />
                    <textarea v-model="mValue.lyric.depict" placeholder="描述" class="cmusic_textarea" style="width:70%; height:110px; margin-left: auto;margin-right: auto;"></textarea>
                </div>
            </div>
            <div class="cwin_displayFlexColumn" style="height: 220px;">
                <div class="cwin_displayFlex">
                    <select-line-vue text="公开" :selected="mValue.lyric.access == Lyric_access_e.Public" @click="mValue.lyric.access = Lyric_access_e.Public" />
                    <select-line-vue text="仅自己可见" :selected="mValue.lyric.access == Lyric_access_e.Private" @click="mValue.lyric.access = Lyric_access_e.Private" />
                </div>
                <div class="cwin_displayFlexColumn" style="height: 40px;">
                    <span v-show="mValue.lyric.access == Lyric_access_e.Public" class="cwin_tipSpan">所有人都可以访问歌词</span>
                    <span v-show="mValue.lyric.access == Lyric_access_e.Private" class="cwin_tipSpan">只有自己可以访问歌词</span>
                </div>
                <div class="cwin_displayFlex">
                    <SelectLineVue text="原创" :selected="mValue.lyric.copyright == Lyric_copyright_e.Original" @click="mValue.lyric.copyright = Lyric_copyright_e.Original" />
                    <SelectLineVue text="转载" :selected="mValue.lyric.copyright == Lyric_copyright_e.Reprint" @click="mValue.lyric.copyright = Lyric_copyright_e.Reprint" />
                </div>
                <div class="cwin_displayFlexColumn" style="height: 40px;">
                    <span v-show="mValue.lyric.copyright == Lyric_copyright_e.Original" class="cwin_tipSpan">这个歌词是我制作的！</span>
                    <span v-show="mValue.lyric.copyright == Lyric_copyright_e.Reprint" class="cwin_tipSpan">这个歌词是别人制作的，且允许我转载</span>
                </div>
            </div>
        </div>
    </PopWinBase>
</template>
