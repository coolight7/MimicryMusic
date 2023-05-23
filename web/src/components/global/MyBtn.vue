<script setup lang="ts">
import MySvg from "./MySvg.vue"
import { reactive, onMounted, watch } from "vue";
const props = defineProps({
    checked: {               //是否选中
        type: Boolean,
        default: false
    },
    shadow: {
        type: Boolean,
        default: true
    },
    enable: {
        type: Boolean,
        default: true
    },
    text: {
        type: String,
        default: ""
    },
    tText: {
        type: String,
        default: ""
    },
    fText: {
        type: String,
        default: ""
    },
    icon: {
        type: String,
        default: ""
    },
    tIcon: {
        type: String,
        default: ""
    },
    fIcon: {
        type: String,
        default: ""
    }
})
const emits = defineEmits({
    'click': null
})

let mValue = reactive({
    style: {
        width: "40px"
    },
})

const btn_click = () => {
    emits('click', props.checked);
}
const update_style = () => {    //选择text、tText 和 fText 三个中最长的字符串计算宽度
    let len = 0;
    if (props.tText.length > props.fText.length) {
        len = (props.tText.length > props.text.length) ? props.tText.length : props.text.length
    } else {
        len = (props.fText.length > props.text.length) ? props.fText.length : props.text.length;
    }
    mValue.style.width = (len * 35 + 40) + "px";
}
const update_text = (in_text: string) => {
    update_style();
}

update_style();     //初始化宽度

onMounted(() => {
    watch(
        () => props.text,
        update_text
    )
    watch(
        () => props.tText,
        update_text
    )
    watch(
        () => props.fText,
        update_text
    )
});
</script>

<template>
    <button :class="[(props.shadow ? 'cmusic_control_btn' : 'cmusic_control_btn_noShadow'),
    { 'cmusic_control_btn_selected': props.checked, 'cmusic_control_btn_disabled': !props.enable }]"
        :disabled=!props.enable :style="mValue.style" @click="btn_click()">
        <MySvg v-show="props.checked && (props.tIcon || props.icon)" :name="props.tIcon ? props.tIcon : props.icon" />
        <MySvg v-show="!props.checked && (props.fIcon || props.icon)" :name="props.fIcon ? props.fIcon : props.icon" />
        <span v-show="props.checked && (props.tText || props.text)">{{ (props.tText ? props.tText : props.text) }}</span>
        <span v-show="!props.checked && (props.fText || props.text)">{{ (props.fText ? props.fText : props.text) }}</span>
    </button>
</template>