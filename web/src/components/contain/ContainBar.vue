<script setup lang="ts">
import MySvg from "../global/MySvg.vue"
import { SrcIcon } from "../../stores/Src";
import { storeToRefs }  from 'pinia';
import { useRouter } from 'vue-router';
import { FooterBar_store } from '../../stores/footer/FooterBar';
import { ContainBar_store, MyRouterPostition_e } from '../../stores/contain/ContainBar';

const containbar_s = ContainBar_store();
const footerBar_s = FooterBar_store();
const router = useRouter();
const {
    isShow,
} = storeToRefs(containbar_s);

const openWarp  = () => { footerBar_s.openWarp(); }
const closeWarp = () => { footerBar_s.closeWarp(); }
const showPosition = (index:MyRouterPostition_e) => { 
    closeWarp();
    switch(index) {
        case MyRouterPostition_e.Home:{
            router.push({
                path:'/'
            })
        }break;
        case MyRouterPostition_e.Playlist:{
            router.push({
                path:'/playlist'
            })
        }break;
        case MyRouterPostition_e.Lyric:{
            router.push({
                path:'/lyric'
            })
        }break;
        case MyRouterPostition_e.User:{
            router.push({
                path:'/user'
            })
        }break;
        case MyRouterPostition_e.Setting:{
            router.push({
                path:'/setting'
            })
        }break;
    }
}
</script>


<template>
    <div v-if="isShow.detail" class="cmusic_btnListBar cmusic_displayFlexColumn_class">
        <ul class="cmusic_btnListBar_ul">
            <!-- 主页 -->
            <li :class="['cmusic_btnListBar_li', ((isShow.position_index == MyRouterPostition_e.Home)?'cmusic_btnListBar_li_selected':'')]" 
                @click="showPosition(MyRouterPostition_e.Home)">
                <div class="cmusic_displayFlex_class cwin_center">
                    <!-- 图标 -->
                    <div class="cmusic_btnListBar_li_img cmusic_control_btn_noShadow cwin_center">
                        <MySvg v-show="isShow.position_index == MyRouterPostition_e.Home" :name="SrcIcon.home_l" />
                        <MySvg v-show="isShow.position_index != MyRouterPostition_e.Home" :name="SrcIcon.home_d" />
                    </div>
                    <span class="cmusic_btnListBar_li_span">主页</span>
                </div>
            </li>
            <!-- 歌单 -->
            <li :class="['cmusic_btnListBar_li', ((isShow.position_index == MyRouterPostition_e.Playlist)?'cmusic_btnListBar_li_selected':'')]" 
                @click="showPosition(MyRouterPostition_e.Playlist)">
                <div class="cmusic_displayFlex_class cwin_center">
                    <!-- 图标 -->
                    <div class="cmusic_btnListBar_li_img cmusic_control_btn_noShadow cwin_center">
                        <MySvg v-show="isShow.position_index == MyRouterPostition_e.Playlist" :name="SrcIcon.playlist_l" />
                        <MySvg v-show="isShow.position_index != MyRouterPostition_e.Playlist" :name="SrcIcon.playlist_d" />
                    </div>
                    <span data-text="歌单" class="cmusic_btnListBar_li_span">歌单</span>
                </div>
            </li>
            <!-- 播放页面按钮 -->
            <li class="cmusic_btnListBar_li" @click="openWarp()">
                <div class="cmusic_displayFlex_class cwin_center">
                    <!-- 图标 -->
                    <div class="cmusic_btnListBar_li_img cmusic_control_btn_noShadow cwin_center">
                        <MySvg :name="SrcIcon.music" />
                    </div>
                    <span data-text="音乐" class="cmusic_btnListBar_li_span">音乐</span>
                </div>
            </li>
            <!-- 歌词 -->
            <li :class="['cmusic_btnListBar_li', ((isShow.position_index == MyRouterPostition_e.Lyric)?'cmusic_btnListBar_li_selected':'')]" 
                @click="showPosition(MyRouterPostition_e.Lyric)">
                <div class="cmusic_displayFlex_class cwin_center">
                    <!-- 图标 -->
                    <div class="cmusic_btnListBar_li_img cmusic_control_btn_noShadow cwin_center">
                        <MySvg v-show="isShow.position_index == MyRouterPostition_e.Lyric" :name="SrcIcon.lyric_l" />
                        <MySvg v-show="isShow.position_index != MyRouterPostition_e.Lyric" :name="SrcIcon.lyric_d" />
                    </div>
                    <span data-text="我" class="cmusic_btnListBar_li_span">歌词</span>
                </div>
            </li>
            <!-- 用户按钮 -->
            <li :class="['cmusic_btnListBar_li', ((isShow.position_index == MyRouterPostition_e.User)?'cmusic_btnListBar_li_selected':'')]" 
                @click="showPosition(MyRouterPostition_e.User)">
                <div class="cmusic_displayFlex_class cwin_center">
                    <!-- 图标 -->
                    <div class="cmusic_btnListBar_li_img cmusic_control_btn_noShadow cwin_center">
                        <MySvg v-show="isShow.position_index == MyRouterPostition_e.User" :name="SrcIcon.user_l" />
                        <MySvg v-show="isShow.position_index != MyRouterPostition_e.User" :name="SrcIcon.user_d" />
                    </div>
                    <span data-text="我" class="cmusic_btnListBar_li_span">我</span>
                </div>
            </li>
            <!-- 设置 -->
            <li @click="showPosition(MyRouterPostition_e.Setting)"
                :class="['cmusic_btnListBar_li', ((isShow.position_index == MyRouterPostition_e.Setting)?'cmusic_btnListBar_li_selected':'')]" >
                <div class="cmusic_displayFlex_class cwin_center">
                    <!-- 图标 -->
                    <div class="cmusic_btnListBar_li_img cmusic_control_btn_noShadow cwin_center">
                        <MySvg v-show="isShow.position_index == MyRouterPostition_e.Setting"  :name="SrcIcon.setting_l" />
                        <MySvg v-show="isShow.position_index != MyRouterPostition_e.Setting"  :name="SrcIcon.setting_d" />
                    </div>
                    <span data-text="设置" class="cmusic_btnListBar_li_span">设置</span>
                </div>
            </li>
        </ul>
    </div>
</template>
