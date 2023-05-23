<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { TipBar_store } from "../../stores/tip/TipBar"
import { SrcIcon } from '../../stores/Src';
import MyBtn from '../global/MyBtn.vue';

const tipBar_s = TipBar_store();

const {
    isShow,

    isShowTip,
    isAnimate,

    strList,
    showIndex
} = storeToRefs(tipBar_s);

const tipBtn_click = () => { tipBar_s.tipBtn_click(); }

</script>


<template>
    <!-- 提示栏 -->
    <div v-if="isShow" id="cmusic_tip" :class="{'cmusic_tip_open':isShowTip}">
        <!-- 显示提示按钮 -->
        <MyBtn :checked="isShowTip" :t-icon="SrcIcon.tip_l" :f-icon="SrcIcon.tip_d" @click="tipBtn_click()" />
        <span :class="['cmusic_tip_span',{'cmusic_tip_span_close':isShowTip == false},{'cmusic_tip_span_animate':isAnimate}]">
            <a :data-text="'&nbsp;' + strList[showIndex]">&nbsp;{{strList[showIndex]}}&nbsp;</a>
        </span>
    </div>
</template>

