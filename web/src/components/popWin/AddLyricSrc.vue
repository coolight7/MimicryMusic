<script setup lang="ts">
import { reactive } from 'vue';
import { AudioLyric_store, LyricItem_c } from "../../stores/lyric/Lyric";
import PopWinBase from "./PopWinBase.vue";

const lyric_s = AudioLyric_store();

const emits = defineEmits({
    'add':(lrcStr:Array<LyricItem_c>) => {
        if(lrcStr) {
            return true;
        } else {
            console.log("AddLyricSrc.vue: 事件 'add' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    "cancle":null
})

let mValue = reactive({
    input_str:""
});

const addLyric = () => {
    let lrcList = lyric_s.parseLyric(mValue.input_str).lrc;
    emits('add', lrcList);
}
const cancle_click = () => {
    emits('cancle');
}

const btnlist = [
    {
        isShow: true,
        str: "添加",
        fun: addLyric
    },
    {
        isShow: true,
        str: "取消",
        fun: cancle_click
    }
]

</script>

<template>
    <PopWinBase title="添加歌词" :f-btns="btnlist">
        <textarea v-model="mValue.input_str" class="cmusic_textarea"></textarea>
        <span class="cwin_tipSpan">在上方文本框中填入歌词</span>
        <span class="cwin_tipSpan" style="margin-bottom: 50px;">支持多行歌词、自动识别时间前缀</span>
    </PopWinBase>
</template>
