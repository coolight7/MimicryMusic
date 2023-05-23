<script setup lang="ts">
import { storeToRefs }  from 'pinia';
import { ref, reactive, onMounted, watchEffect } from 'vue';
import { Global_store } from '../../stores/Global';
import { Audio_store } from '../../stores/audio/Audio';
import { AudioLyric_store, Lyric_c, LyricItem_c, LyricSrc_c } from '../../stores/lyric/Lyric';
import { SrcIcon } from '../../stores/Src';
import lyricListVue from './LyricList.vue';
import MySvg from "../global/MySvg.vue";
import { Song_store } from '../../stores/playList/Song';

const audio_s = Audio_store();
const lyric_s = AudioLyric_store();
const global_s = Global_store();
const song_s = Song_store();

const lyric_list = <any>ref(null);          //子组件

let mValue = reactive({
    offsetTime:0,       //时间偏移量
    lyric:new Lyric_c(),
})
mValue.lyric.src.lrc.push(new LyricItem_c(-1, "暂无歌词"));
mValue.lyric.srcAvailable = true;

const update_lrcObj = async (in_lrcid:number) => {
    if(mValue.lyric.srcAvailable == false || mValue.lyric.lrcid != in_lrcid) {
        if(in_lrcid >= 0) {
            const reSrc = await lyric_s.get_lrcSrc(in_lrcid, true);
            if(null != reSrc) {
                mValue.lyric.lrcid = in_lrcid;
                mValue.lyric.src = reSrc;
                mValue.lyric.srcAvailable = true;
                return;
            }
        } 
        mValue.lyric = new Lyric_c();
        mValue.lyric.src.lrc.push(new LyricItem_c(-1, "暂无歌词"));
        mValue.lyric.srcAvailable = true;
        mValue.lyric.lrcid = in_lrcid;
    }
}

let lrcNowIndex = ref(0);   //当前播放歌词下标

function shiftOffSetTime(shift_time:number) {
    let result = mValue.offsetTime + shift_time;
    if(result < -700 || result > 700) {
        return;
    }
    mValue.offsetTime = result;
}
function setOffSetTime(in_time:number) {
    if(in_time < -700 || in_time > 700) {
        return;
    }
    mValue.offsetTime = in_time;
}
//歌词项点击事件
const lyric_item_click = (item:LyricItem_c) => {
    let caudio = audio_s.audioPlayer;
    if(item.get_time() >= 0 && item.get_time() <= caudio.duration) {
        caudio.currentTime = item.get_time();
    }
}
//选择歌词
const selectLyric = (in_lrcid:number) => {
    if(in_lrcid > 0) {
        let sid = Song_store().getSelectSong.sid;
        update_lrcObj(in_lrcid);
        if(sid > 0) {       //加入歌词指定映射表
            lyric_s.songLrcMap_set(sid, in_lrcid);
        }
    }
}
const setLrcIndex = (in_list:Array<LyricItem_c>, in_time:number, in_offsetTime:number) => {
    let result = lyric_s.findItemByTime(in_list, in_time, in_offsetTime);
    if(result != lrcNowIndex.value) {
        lrcNowIndex.value = result;
        if(lyric_s.enable.barrageLrc) {
            lyric_list.value.addLyricBarrageByIndex(result, false);
        }
        lyric_list.value.scrollToLrc(result, false);
    }
}

onMounted(() => {
    watchEffect(() => {
        update_lrcObj(
            (function () {
                let relrcid = lyric_s.songLrcMap_get(song_s.selectSong.sid);
                if (relrcid) {
                    return relrcid;
                } else {
                    return parseInt(song_s.selectSong.lyric.src);
                }
            })()
        );
    })
    watchEffect(() => {     //监听播放时长的变化而修改lrcNowIndex,并调用子组件的滚动歌词和弹幕
        setLrcIndex(<Array<LyricItem_c>>(mValue.lyric.src.lrc), lyric_s.audio_currentTime, mValue.offsetTime);
    })
})

</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <div class="cmusic_displayFlex_class cwin_center" style="height: 40px;">
            <div class="cmusic_displayFlex_class" style="width:auto">
                <!-- 减速按钮 -->
                <button @click="shiftOffSetTime(-0.1)" class="cmusic_control_btn_noShadow" style="margin-right: 10px;">
                    <my-svg :name="SrcIcon.reduce" />
                </button>
                <!-- 调速按钮 -->
                <button class="cmusic_control_speed cmusic_control_btn" style="width:80px;" 
                    @click="setOffSetTime(0)">
                    <my-svg :name="SrcIcon.speed" />
                    <span style="font-size: medium;">{{ mValue.offsetTime.toFixed(1) }}</span>
                </button>
                <!-- 加速按钮 -->
                <button @click="shiftOffSetTime(0.1)" class="cmusic_control_btn_noShadow" >
                    <my-svg :name="SrcIcon.increase" />
                </button>
            </div>
        </div>
        <lyric-list-vue ref="lyric_list"
            :lrcObj="<Lyric_c>(mValue.lyric)"
            :lrcNowIndex="lrcNowIndex"
            :offsetTime="mValue.offsetTime"
            @item-click="lyric_item_click"
            @select-lyric="selectLyric"
            style="height: 100%;"/>
    </div>
</template>