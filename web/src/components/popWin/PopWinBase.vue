<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive, onMounted, watchEffect } from "vue";
import { Style_store } from '../../stores/Style';
import { FooterBtn } from "../../stores/popWin/PopWin"
import footerBtn from "../popWin/FooterBtn.vue";

const {
  popWin
} = storeToRefs(Style_store());

const props = defineProps({
    title:{
        type:String,
        default:""
    },
    fBtns:{     //底部按钮数组
        type:Array<FooterBtn>,
        default:new Array<FooterBtn>()
    }
})

let mValue = reactive({
    title:props.title,
    fBtns:props.fBtns
})

const update_title = (in_title:string) => {
    mValue.title = in_title;
}
const update_fBtns = (in_fBtns:Array<FooterBtn>) => {
    mValue.fBtns = in_fBtns;
}

onMounted(() => {
    watchEffect(() => {
        update_title(props.title);
    })
    watchEffect(() => {
        update_fBtns(props.fBtns);
    })
})

</script>

<template>
    <div :style="popWin.popWin_height" class="cwin_wrap cwin_displayFlexColumn">
        <div class="cwin_content cwin_displayFlexColumn" :style="popWin.content_height">
            <div class="cwin_displayFlexColumn" style="width:90%;padding:5%;">
                <div class="cwin_displayFlexColumn" style="height: 50px;">
                    <strong class="cwin_header_title">{{mValue.title}}</strong>
                </div>
                <slot></slot>
                <footer-btn :btns="mValue.fBtns" />
            </div>
        </div>
    </div>
</template>