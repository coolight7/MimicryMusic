<script setup lang="ts">
import { storeToRefs }  from 'pinia';
import headVue          from './components/head/HeadDetails.vue';
import footerdetailsVue from './components/footer/FooterDetails.vue';
import BarrageVue       from './components/barrage/Barrage.vue';
import audiovue         from './components/audio/Audio.vue';

import warpVue          from './components/warp/WarpDetails.vue';
import containbarVue    from './components/contain/ContainBar.vue';
import ContainTopBarVue from './components/contain/ContainTopBar.vue';
import ContainFunBar from './components/contain/ContainFunBar.vue';

import { Setting_store } from './stores/setting/Setting';
import { Style_store }     from './stores/Style';
import { Global_store }    from './stores/Global';
import { Device_store }    from './stores/Device';
import { FooterBar_store } from './stores/footer/FooterBar';
import { PlayList_store }  from './stores/playList/PlayList';
import { User_store } from './stores/user/User';
import { GlobalComp_store } from './stores/global/GlobalComp';
import FooterInfo from './components/footer/FooterInfo.vue';

const style_s = Style_store();
const device_s = Device_store();
const global_s = Global_store();
const playlist_s = PlayList_store();

const {
    isShow
} = storeToRefs(FooterBar_store());

const {
    view
} = storeToRefs(Setting_store());

const {
    cmusic_containContent_style,
} = storeToRefs(style_s);

window.onload = async function() {
    //自动设置真实设备类型
    device_s.init();
    style_s.init();
    //自适应设备
    //重设缩放view_zoom
    Device_store().autoViewZoom();
    //重设大小
    Style_store().autoResize();
    /*添加大小更改监听函数*/
    window.addEventListener('resize', () => {
        Style_store().autoResize();
    });
    new Promise<void>(async () => {
        //尝试自动登录
        const user_s = User_store();
        if(user_s.load_cache_jwt() == false) {
            if(await user_s.autoSignIn(true, false) == false) {
                global_s.signOut_todo();
            }
        }
        GlobalComp_store().load_homeTip_auto(false).then(
            (array) => {
                if(null != array) {
                    GlobalComp_store().homeTipData = array;
                }
            }
        );
    });
    //读取链接中的参数
    playlist_s.loadUrlParam();
}

</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <audiovue />
        <!-- 炫彩时显示的背景圆 -->
        <div v-show="view.type == 2" class="cmusic_color_div">
            <div class="cmusic_color cmusic_color-1"></div>
            <div class="cmusic_color cmusic_color-2"></div>
            <div class="cmusic_color cmusic_color-3"></div>
        </div>
        <!-- 顶栏 -->
        <head-vue style="margin-top: 10px;margin-bottom: 10px;" />
        <!-- 弹幕墙 -->
            <barrage-vue style="width:100%;height:80%;" />
            <containbar-vue />
            <contain-fun-bar />
            <div class="cmusic_displayFlexColumn_class">
                <div class="cmusic_displayFlexColumn_class cwin_center" :style="cmusic_containContent_style">
                    <contain-top-bar-vue />
                </div>
                <div class="cmusic_displayFlex_class" v-show="!isShow.rectangle">
                    <div class="cmusic_contain cmusic_displayFlexColumn_class" >
                        <div class="cmusic_displayFlexColumn_class cwin_center" >
                            <router-view v-slot="{ Component }" :style="cmusic_containContent_style">
                                <transition name="router_transition">
                                    <component class="cmusic_router-component-view" :is="Component" />
                                </transition>
                            </router-view>
                        </div>
                    </div>
                </div>
                <warp-vue v-show="isShow.rectangle" />
            </div>
        <!-- 底栏 -->
        <footerdetails-vue />
        <footer-info style="margin-top: 100px;margin-bottom: 100px;"></footer-info>
        <div style="height: 100px;"></div>
    </div>
</template>

<style>
/* 路由动画*/
.cmusic_router-component-view {
    transition: all .8s;
}
/* 离开 */
.router_transition-leave-to {
    opacity: 0;
    transform: translateX(50px);
}
.router_transition-leave-active {
    position: absolute;
    top:30%;
}
/* 进入 */
.router_transition-enter-from {
    opacity: 0;
    transform: translateX(-50px);
    width: 100% !important;
}
</style>