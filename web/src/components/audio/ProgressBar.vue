<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Global_store } from '../../stores/Global';
import { Audio_store } from "../../stores/audio/Audio"
import { ref } from "vue";
import { Device_store } from '../../stores/Device';

const global_s = Global_store();
const audio_s = Audio_store();

const cmusic_music_progressBar = <any>ref(null);

const {
    isShow,
    alltime,
    nowtime,
    progress_style,
    loadProgress_style,
} = storeToRefs(audio_s);

//拖动音乐进度条
const music_progress_mousedown = (event:any) => {
    event = event || window.event;
    let caudio = audio_s.audioPlayer;
    if (isNaN(caudio.duration)) {
        return;
    }
    let proBar = cmusic_music_progressBar.value;
    let location_left = global_s.getLocation_left(proBar);  //获取绝对位置
    let progressX = event.clientX - location_left;
    let proBar_width = proBar.clientWidth * Device_store().view_zoom;  //跟随缩放比例获取实际大小
    let length = caudio.duration * progressX / proBar_width;  //记录当前播放的时长
    let booldo = true;
    caudio.currentTime = length;

    // 绑定拖动事件
    document.onmousemove = function (event) {
        event = event || window.event;
        // 获取鼠标坐标
        progressX = event.clientX - location_left;
        if (progressX <= 0) {
            progressX = 0;    // 如果拖动条超出范围，则归零
        } else if (progressX >= proBar_width) {
            progressX = proBar_width;
        }
        let cache_length = caudio.duration * progressX / proBar_width;
        //防止重复
        if (length == cache_length) {
            return false;
        }
        length = cache_length;
        if (booldo == false) {
            return false;
        }
        booldo = false;
        //类似于加锁，降低改变速率，隔一段事件才修改已播放时长
        setTimeout(function () {
            caudio.currentTime = length;
            booldo = true;
        }, 200);
    };

    // 为右侧圆点绑定鼠标抬起事件
    document.onmouseup = function (event) {
        event = event || window.event;
        // 取消鼠标移动事件
        document.onmousemove = null;
        // 取消鼠标抬起事件
        document.onmouseup = null;
    };
    //取消浏览器对拖拽内容进行搜索的默认行为
    return false;
}

</script>

<template>
    <!-- 进度条 -->
    <div class="cmusic_control_progress" v-show="isShow.progressBar">
        <span class="cmusic_control_span_alltime">{{ alltime }}</span>
        <span ref="cmusic_music_progressBar" class="cmusic_control_span_progressBar" @mousedown="music_progress_mousedown($event)">
            <div class="cmusic_displayFlex_class cmusic_control_progress_div">
                <span class="cmusic_control_span_loadProgress" :style="loadProgress_style"></span>
                <span class="cmusic_control_span_progress" :style="progress_style"></span>
            </div>
        </span>
        <span class="cmusic_control_span_time">{{ nowtime }}</span>
    </div>
</template>