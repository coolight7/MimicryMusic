<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Setting_store } from '../../stores/setting/Setting';
import { Device_store } from '../../stores/Device';
import { SrcIcon } from '../../stores/Src';
import CheckboxVue from '../global/Checkbox.vue';
import SelectLineVue from '../global/SelectLine.vue';
import MyBtn from "../global/MyBtn.vue"

const setting_s = Setting_store();
const device_s = Device_store();

const {
    view,
    isable,
    isable_barrageLrc,
    isable_fullScreen,
    isable_songThumb_wave,
    isable_songThumb_rotate,
    animation,
} = storeToRefs(setting_s);

const {
    select_type,
    view_zoom
} = storeToRefs(device_s);

function setting_barrageLrc_click() {
    if(setting_s.isable_barrageLrc) {
        setting_s.disable_barrageLrc();
    } else {
        setting_s.enable_barrageLrc();
    }
}
function setting_fullScreen_click() {
    if(setting_s.isable_fullScreen) {
        setting_s.disable_fullScreen();
    } else {
        setting_s.enable_fullScreen();
    }
}

const setViewType   = (in_type:number) => { setting_s.setViewType(in_type); }
const setSelectType = (in_type:number) => { device_s.setSelectType(in_type); }

const autoViewZoom = () => {
    device_s.autoViewZoom();
}
const shiftViewZoom = (in_shift:number) => {
    device_s.setViewZoom(device_s.view_zoom + in_shift);
}

const set_animation = (in_animation:number) => { setting_s.set_animation(in_animation); }

const set_isable_songThumb_wave = (in_bool:boolean) => { setting_s.set_isable_songThumb_wave(in_bool) }
const set_isable_songThumb_rotate = (in_bool:boolean) => { setting_s.set_isable_songThumb_rotate(in_bool); }
const set_transition = (in_bool:boolean) => { setting_s.set_transition(in_bool); }

</script>

<template>
    <!-- 设置框 -->
    <div class="cmusic_displayFlexColumn_class" style="width:90%;">
        <div class="cmusic_displayFlex_class">
            <select-line-vue 
                text="极夜"
                :selected="view.type == 1"
                :t-icon="SrcIcon.moon_l"
                :f-icon="SrcIcon.moon_d"
                @click="setViewType(1)">
            </select-line-vue>
            <select-line-vue 
                text="炫彩"
                :selected="view.type == 2"
                :t-icon="SrcIcon.colorful_l"
                :f-icon="SrcIcon.colorful_d"
                @click="setViewType(2)">
            </select-line-vue>
            <select-line-vue 
                text="极昼"
                :selected="view.type == 3"
                :t-icon="SrcIcon.star2_l"
                :f-icon="SrcIcon.star2_d"
                @click="setViewType(3)">
            </select-line-vue>
        </div>
        <div class="cmusic_displayFlex_class" style="margin-bottom:10px;">
            <select-line-vue 
                text="移动端"
                :selected="select_type == 1"
                :t-icon="SrcIcon.mobile_l"
                :f-icon="SrcIcon.mobile_d"
                @click="setSelectType(1)">
            </select-line-vue>
            <select-line-vue 
                text="自适应"
                :selected="select_type == 100"
                :t-icon="SrcIcon.mobileAi_l"
                :f-icon="SrcIcon.mobileAi_d"
                @click="setSelectType(100)">
            </select-line-vue>
            <select-line-vue 
                text="桌面端"
                :selected="select_type == 0"
                :t-icon="SrcIcon.desktop_l"
                :f-icon="SrcIcon.desktop_d"
                @click="setSelectType(0)">
            </select-line-vue>
        </div>
        <div class="cmusic_displayFlex_class cwin_center" style="width:auto;">
            <my-btn :f-icon="SrcIcon.reduce" :shadow="false"  @click="shiftViewZoom(-0.1)" />
            <my-btn :f-text="'缩放：' + view_zoom.toFixed(2)" @click="autoViewZoom" />
            <my-btn :f-icon="SrcIcon.increase" :shadow="false" @click="shiftViewZoom(0.1)" />
        </div>
        <div class="cmusic_displayFlex_class" style="width:auto;margin-bottom: 10px;">
            <span class="cmusic_checkbox_span">动画： </span>
            <div class="cmusic_displayFlex_class" style="width:300px;">
                <select-line-vue
                    text="关闭"
                    :selected="animation == 0"
                    @click="set_animation(0)">
                </select-line-vue>
                <select-line-vue
                    text="低"
                    :selected="animation == 10"
                    @click="set_animation(10)">
                </select-line-vue>
                <select-line-vue
                    text="中"
                    :selected="animation == 20"
                    @click="set_animation(20)">
                </select-line-vue>
                <select-line-vue
                    text="高"
                    :selected="animation == 30"
                    @click="set_animation(30)">
                </select-line-vue>
                <select-line-vue
                    text="自定义"
                    :selected="animation == 100"
                    @click="set_animation(100)">
                </select-line-vue>
            </div>
        </div>
        <!-- 自定义动画设置 -->
        <div class="cmusic_displayFlexColumn_class cmusic_area" v-show="animation == 100" style="padding:10px;margin-bottom:10px">
            <div class="cmusic_checkbox_setbg">
                <span class="cmusic_checkbox_span">过渡动画</span>
                <checkbox-vue :checked="isable.transition"
                    @click="set_transition(!isable.transition)" />
            </div>
            <div class="cmusic_checkbox_setbg">
                <span class="cmusic_checkbox_span">播放时歌曲封面旋转</span>
                <checkbox-vue :checked="isable_songThumb_rotate"
                    @click="set_isable_songThumb_rotate(!isable_songThumb_rotate)" />
            </div>
            <div class="cmusic_checkbox_setbg">
                <span class="cmusic_checkbox_span">播放时歌曲封面波浪</span>
                <checkbox-vue :checked="isable_songThumb_wave"
                    @click="set_isable_songThumb_wave(!isable_songThumb_wave)" />
            </div>
        </div>
        <div class="cmusic_checkbox_setbg">
            <span class="cmusic_checkbox_span">歌词弹幕</span>
            <checkbox-vue :checked="isable_barrageLrc"
                @click="setting_barrageLrc_click" />
        </div>
        <div class="cmusic_checkbox_setbg">
            <span class="cmusic_checkbox_span">全屏</span>
            <checkbox-vue :checked="isable_fullScreen"
                @click="setting_fullScreen_click" />
        </div>
    </div>
</template>