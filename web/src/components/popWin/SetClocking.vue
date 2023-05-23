<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive } from "vue";
import { PopWin_SetClocking_store } from "../../stores/popWin/SetClocking"
import { SrcIcon } from '../../stores/Src';
import PopWinBase from "./PopWinBase.vue";
import SelectLineVue from '../global/SelectLine.vue';
import MyBtn from '../global/MyBtn.vue';

const setclocking_s = PopWin_SetClocking_store();

const emits = defineEmits({
    'add':null,
    "cancle":null
})

let mValue = reactive({

})

const {
    getLengthHour,
    getLengthMinute,
    getsurplusStr,
    length,
    surplus,
} = storeToRefs(setclocking_s);

const confirm_click = () => {
    emits('add');
    setclocking_s.confirm();
}
const cancle_click = () => {
    emits('cancle');
}

const btnlist = [
    {
        isShow:true,
        str:"设置",
        fun:confirm_click
    },
    {
        isShow:true,
        str:"取消",
        fun:cancle_click
    }
]

const setTime       = (in_length:number) => { setclocking_s.setTime(in_length); }
const changeTime    = (in_num:number) => { setclocking_s.changeTime(in_num); }
const stopClocking_click  = () => { setclocking_s.stopClocking_click(); }

</script>

<template>
    <PopWinBase title="定时停止" :f-btns="btnlist">
        <div class="cwin_displayFlexColumn">
            <div class="cmusic_displayFlex_class" style="margin-bottom:30px;">
                <select-line-vue text="30分钟" :selected="length == 1800" @click="setTime(30 * 60)" />
                <select-line-vue text="1小时" :selected="length == 3600" @click="setTime(60 * 60)" />
                <select-line-vue text="自定义" :selected="length != 3600 && length != 1800" @click="setTime(0)" />
            </div>
        </div>

        <div class="cmusic_displayFlex_class cwin_center" style="width:80%;margin-bottom:40px;">
            <!-- 小时 -->
            <div class="cmusic_displayFlexColumn_class cwin_center" style="width:80%;">
                <my-btn :shadow="false" :icon="SrcIcon.increase" @click="changeTime(3600)" />
                <div class="cmusic_displayFlex_class" style="width:auto;">
                    <span class="cwin_setclocking_time_span">{{getLengthHour}}</span>
                    <span class="cwin_setclocking_time_unit"> 小时</span>
                </div>
                <my-btn :shadow="false" :icon="SrcIcon.reduce" @click="changeTime(-3600)" />
            </div>
            <!-- 分钟 -->
            <div class="cmusic_displayFlexColumn_class cwin_center" style="width:80%;">
                <my-btn :shadow="false" :icon="SrcIcon.increase" @click="changeTime(60)" />
                <div class="cmusic_displayFlex_class" style="width:auto;">
                    <span class="cwin_setclocking_time_span">{{getLengthMinute}}</span>
                    <span class="cwin_setclocking_time_unit"> 分钟</span>
                </div>
                <my-btn :shadow="false" :icon="SrcIcon.reduce" @click="changeTime(-60)" />
            </div>
        </div>
        <div v-if="surplus != 0" class="cmusic_displayFlex_class cwin_center" style="margin-bottom: 60px;">
            <span class="cwin_setclocking_tip cwin_center">
                已有定时倒计时：{{getsurplusStr}}
            </span>
            <MyBtn :icon="SrcIcon.timeCancle" @click="stopClocking_click()" text="取消" />
        </div>
    </PopWinBase>
</template>