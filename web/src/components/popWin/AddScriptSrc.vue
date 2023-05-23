<script setup lang="ts">
import { reactive } from 'vue';
import { MyScriptItem_c } from '../../stores/myscript/MyScript';
import PopWinBase from "./PopWinBase.vue";

const emits = defineEmits({
    'add':(lrcStr:Array<MyScriptItem_c>) => {
        if(lrcStr) {
            return true;
        } else {
            console.log("AddScriptSrc.vue: 事件 'add' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    "cancle":null
})

let mValue = reactive({
    input_str:""
});

const addLyric = () => {
    //转input_str
    let scriptList = new Array<MyScriptItem_c>();
    emits('add', scriptList);
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
    <PopWinBase title="添加任务" :f-btns="btnlist">
        <textarea v-model="mValue.input_str" class="cmusic_textarea"></textarea>
        <span class="cwin_tipSpan" style="margin-bottom: 50px;">在上方文本框中填入任务代码</span>
    </PopWinBase>
</template>
