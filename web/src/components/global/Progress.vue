<script setup lang="ts">
import { Device_store } from "../../stores/Device";
import { reactive, ref, onMounted, watchEffect } from "vue";
import { Global_store } from "../../stores/Global";

const global_s = Global_store();

const props = defineProps({
    //length  [0, 1]
    length: {
        type:Number,
        required:true
    },
})

//事件信号
const emits = defineEmits({
    'mousedown':(in_length) => {
        if(in_length) {
            return true;
        } else {
            console.warn("Progress.vue: 事件'mousedown'所绑定的处理函数未接收关键参数");
            return true;
        }
    },
    'mousemove':(in_length) => {
        if(in_length) {
            return true;
        } else {
            console.warn("Progress.vue: 事件'mousedown'所绑定的处理函数未接收关键参数");
            return true;
        }
    },
    'mouseup':null
})

let mValue = reactive({
    progress_style:{
        width:"0px"
    }
})
//dom元素
const cmusic_progressBar = <any>ref(null);
//进度条拖动事件
const progress_mousedown = (event:any) => {
    event = event || window.event;
    let proBar = cmusic_progressBar.value;
    let location_left = global_s.getLocation_left(proBar);
    let progressX = event.clientX - location_left;
    let proBar_width = proBar.clientWidth * Device_store().view_zoom;
    let length = progressX / proBar_width;
    let booldo = true;
    if (length < 0) {
        length = 0;
    } else if (length > 1) {
        length = 1;
    }
    emits('mousedown', length);
    updateLength(length);
    // 绑定拖动事件
    document.onmousemove = function (event) {
        event = event || window.event;
        // 获取鼠标坐标
        progressX = event.clientX - location_left;
        if (progressX <= 0) {
            progressX = 0;
        } else if (progressX > proBar_width) {
            progressX = proBar_width;
        }
        let cache_length = progressX / proBar_width;
        if (length == cache_length)
            return false;
        length = cache_length;
        if (booldo == false) {
            return false;
        }
        booldo = false;
        //类似于加锁，降低改变速率，隔一段事件才修改已播放时长
        setTimeout(function () {
            emits('mousemove', length);
            updateLength(length);
            booldo = true;
        }, 200);
    };

    // 为右侧圆点绑定鼠标抬起事件
    document.onmouseup = function (event) {
        document.onmousemove = null;
        document.onmouseup = null;
        emits('mouseup');
    };
    return false;
}
//in_length为 [0, 1]
const updateLength = (in_length:number) => {
    if(in_length >= 0 && in_length <= 1) {
        mValue.progress_style.width = in_length * 100 + "%";
    }
}

onMounted(() => {
    watchEffect(() => {     //监听播放时长的变化而修改lrcNowIndex,并调用子组件的滚动歌词和弹幕
        updateLength(props.length);
    })
})
</script>

<template>
    <span ref="cmusic_progressBar" class="cmusic_control_volume_progressBar" @mousedown="progress_mousedown($event)">
        <div class="cmusic_displayFlex_class cmusic_control_progress_div">
            <span class="cmusic_control_volume_progress" :style="mValue.progress_style"></span>
        </div>
    </span>
</template>