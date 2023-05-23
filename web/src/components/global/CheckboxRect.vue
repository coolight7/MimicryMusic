<script setup lang="ts">
import { SrcIcon } from "../../stores/Src";
import MyBtnVue from "./MyBtn.vue";
const props = defineProps({
    checked:{
        type:Boolean,
        default:false
    },
    enable:{
        type:Boolean,
        default:true
    }
})
const emits = defineEmits({
    'click':null
})

const check_click = ($event:any) => {
    emits('click', $event);
}

</script>

<!-- 多选框 -->
<template>
    <MyBtnVue 
        :shadow="props.checked"
        :checked="props.checked"
        :enable="props.enable"
        :t-icon="SrcIcon.checkRect_l"
        :f-icon="SrcIcon.checkRect_d"
        @click="check_click($event)"
        style="margin:0px" />
</template>