<script setup lang="ts">
import { storeToRefs }  from 'pinia';
import { Song_store }   from '../../stores/playList/Song';
import { Style_store }  from '../../stores/Style';
import { FooterBar_store } from '../../stores/footer/FooterBar';
import { reactive } from "vue";
import { Setting_store } from "../../stores/setting/Setting"
import { SrcIcon } from '../../stores/Src';

import songthumbVue     from '../audio/SongThumb.vue';
import progressbarVue   from '../audio/ProgressBar.vue';
import controlbtnVue    from '../audio/ControlBtn.vue';
import MyBtn from "../global/MyBtn.vue"

const song_s = Song_store();
const setting_s = Setting_store();
const footerBar_s = FooterBar_store();

let mValue = reactive({
    isShowBarContain:true
})

const {
    isShow
} = storeToRefs(footerBar_s);

const {
    selectSong,
} = storeToRefs(song_s);

const {
    cmusic_content_style
} = storeToRefs(Style_store());

const controlWarp_click = () => {
    if(footerBar_s.isShow.rectangle) {
        mValue.isShowBarContain = true;
        footerBar_s.closeWarp();
    } else {
        mValue.isShowBarContain = false;
        footerBar_s.openWarp();
    }
}

</script>

<template>
    <div v-if="isShow.detail" class="cmusic_footerBar cmusic_footerBar_bg">
        <span v-if="setting_s.view.type == 2 && mValue.isShowBarContain" :style="cmusic_content_style" class="cmusic_footerBar_span">
        </span>
        <div :class="[{'cmusic_footerBar_content':mValue.isShowBarContain}, 'cmusic_footerBar_bg']" 
            :style="cmusic_content_style">
            <songthumb-vue v-show="mValue.isShowBarContain" class="cmusic_footerBar_songThumb"/>
            <div style="width:10%"></div>
            <div v-show="mValue.isShowBarContain" 
                class="cmusic_displayFlexColumn_class cmusic_footerBar_top" 
                style="width:80%;margin: 0px;pointer-events: all;">
                <div class="cmusic_displayFlex_class" style="height:50px;">
                    <div class="cmusic_displayFlexColumn_class cwin_center" style="width:100%;overflow:hidden;">
                        <strong class="cmusic_info_songName" style="font-size: larger;">{{ selectSong.name }}</strong>
                    </div>
                    <controlbtn-vue style="height:100%;width:100%;"/>
                    <div class="cmusic_displayFlexColumn_class cwin_center" style="width:100%;overflow: hidden;">
                        <span class="cmusic_info_artist">{{ selectSong.artist }}</span>
                    </div>
                </div>
                <div class="cmusic_displayFlex_class" style="height:20px;width: 100%;">
                    <progressbar-vue class="cmusic_footerBar_progress" />
                </div>
            </div>
            <!-- 显示/隐藏按钮 -->
            <div :class="['cmusic_displayFlexColumn_class','cwin_center',{'cmusic_footerBar_btn':mValue.isShowBarContain == false}]" 
                style="width:10%;height:100%;margin:0px;pointer-events: all;">
                <my-btn :checked="isShow.rectangle" 
                    :t-icon="SrcIcon.pointDown"
                    :f-icon="SrcIcon.pointUp"
                    @click="controlWarp_click()" 
                    title="显示/隐藏播放页面"
                    style="height:30px;margin-bottom: 10px;"
                />
                <my-btn :checked="mValue.isShowBarContain"
                    :t-icon="SrcIcon.stack_l"
                    :f-icon="SrcIcon.stack_d"
                    @click="mValue.isShowBarContain = !mValue.isShowBarContain"
                    style="height:30px;"
                />
            </div>
        </div>
    </div>
</template>