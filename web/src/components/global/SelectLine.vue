<script setup lang="ts">
import MySvg from "./MySvg.vue"
import { reactive, onMounted, watchEffect } from "vue";
const props = defineProps({
    selected: {
        type:Boolean,
        default:false
    },
    text:{
        type:String,
        default:""
    },
    tText:{
        type:String,
        default:""
    },
    fText:{
        type:String,
        default:""
    },
    icon:{
        type:String,
        default:""
    },
    tIcon:{
        type:String,
        default:""
    },
    fIcon:{
        type:String,
        default:""
    }
})

let mValue = reactive({
    selected:props.selected,
    text:props.text,
    tText:props.tText,
    fText:props.fText,
    icon:props.icon,
    tIcon:props.tIcon,
    fIcon:props.fIcon
})

//事件信号
const emits = defineEmits({
    'update:selected':null,
    'click':null
})
const select_click = () => {
    emits('click', props.selected);
}
const update_selected = (in_selected:boolean) => {
    mValue.selected = in_selected;
}
const update_text = (in_text:string) => {
    mValue.text = in_text;
}
const update_tText = (in_tText:string) => {
    mValue.tText = in_tText;
}
const update_fText = (in_fText:string) => {
    mValue.fText = in_fText;
}
const update_icon = (in_icon:string) => {
    mValue.icon = in_icon;
}
const update_tIcon = (in_tIcon:string) => {
    mValue.tIcon = in_tIcon;
}
const update_fIcon = (in_fIcon:string) => {
    mValue.fIcon = in_fIcon;
}
onMounted(() => {
    watchEffect(() => {
        update_selected(props.selected);
    })
    watchEffect(() => {
        update_text(props.text);
    })
    watchEffect(() => {
        update_tText(props.tText);
    })
    watchEffect(() => {
        update_fText(props.fText);
    })
    watchEffect(()=>{
        update_icon(props.icon);
    })
    watchEffect(()=>{
        update_tIcon(props.tIcon);
    })
    watchEffect(()=>{
        update_fIcon(props.fIcon);
    })
});
</script>

<template>
    <button @click="select_click()"
        :class="['cmusic_control_btn_noShadow','cmusic_selectLine_button',{'cmusic_selectLine_button_select':mValue.selected}]">
        <MySvg v-show="mValue.selected && (mValue.tIcon || mValue.icon)" :name="mValue.tIcon?mValue.tIcon:mValue.icon" />
        <MySvg v-show="!mValue.selected && (mValue.fIcon || mValue.icon)" :name="mValue.fIcon?mValue.fIcon:mValue.icon" />
        <span v-show="mValue.selected && (mValue.tText || mValue.text)" style="font-size:medium;">{{(mValue.tText?mValue.tText:mValue.text)}}</span>
        <span v-show="!mValue.selected && (mValue.fText || mValue.text)" style="font-size:medium;">{{(mValue.fText?mValue.fText:mValue.text)}}</span>
    </button>
</template>