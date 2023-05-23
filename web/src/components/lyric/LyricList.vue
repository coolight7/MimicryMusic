<script setup lang="ts">
import { storeToRefs }  from 'pinia';
import { ref, toRefs, onMounted } from 'vue';
import { PopWin_store } from "../../stores/popWin/PopWin";
import { AudioLyric_store,Lyric_c, LyricSrc_c, LyricItem_c } from '../../stores/lyric/Lyric'
import { Global_store } from '../../stores/Global';
import { SrcIcon } from '../../stores/Src';
import MyBtnVue from '../global/MyBtn.vue';
import { Barrage_store } from '../../stores/barrage/Barrage';

const lyric_s = AudioLyric_store();
const global_s = Global_store();
const popwin_s = PopWin_store();

const cmusic_lyric_ul = ref(null);
let lock = {        //模拟加锁，
    controlScrollFun:   0,      //一段时间内控制监听滚动的函数数量
    enableListerScroll: true,   //用于控制监听滚动
    disableAudoScroll:           false,  //是否允许自动滚动
} 

const props = defineProps({
    lrcObj:{
        type:Lyric_c,
        required:true,
    },
    lrcNowIndex:{
        type:Number,
        default:-1
    },
    offsetTime:{
        type:Number,
        default:0
    }
})

const { 
    lrcObj, 
    lrcNowIndex,    //正在播放的歌词下标
} = toRefs(props);

//事件信号
const emits = defineEmits({
    'item-click':(item) => {
        if(item) {
            return true;
        } else {
            console.warn("LyricList.vue: 事件 'item-click' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    'select-lyric':(lrcid) => {
        if(lrcid) {
            return true;
        } else {
            console.warn("LyricList.vue: 事件 'select-lyric' 所绑定的函数未接收关键参数");
            return true;
        }
    }
})


const lry_scrollAndBarrage = function(in_time:number, isRepeatBarrage:boolean = false) {
    let index = lyric_s.findItemByTime(props.lrcObj.src.lrc, in_time, props.offsetTime);
    addLyricBarrageByIndex(index, isRepeatBarrage);
    scrollToLrc(index, false);
}
const addLyricBarrageByIndex = function(index:number, isRepeat:boolean = false) {
    if(index < 0 
        || index >= props.lrcObj.src.lrc.length
        || (!isRepeat && index == props.lrcNowIndex)) {
        return;
    }
    Barrage_store().addBarrage(props.lrcObj.src.lrc[index].content);
}
//监听歌词列表滚动事件
const scrollListener = function() {
    /*目的是监听到用户滚动时，禁用3秒内的自动滚动
    * 由于监听的是滚动事件，当自动滚动时（scrollToLrc()内调用scrollTo()）也会触发
    * 因此需要在自动滚动期间禁用监听。
    * 而一次滚动会触发多个滚动事件，因此会放置多个定时器setTimeout
    * 导致控制混乱，因此再引入funNum记录一段时间内的触发的定时器个数
    * 而当定时器setTimeout执行时，如果它本身的下标不等于定时器个数
    * 说明有新定时器在接管，则自己不需要管了，就直接return掉。
    */
    if (lock.enableListerScroll) {
        //获取当前定时器下标（个数）
        let funNum = ++(lock.controlScrollFun);
        //禁用自动滚动
        lock.disableAudoScroll = true;
        setTimeout(function () {
            //判断自己是不是最新的定时器
            if (funNum != lock.controlScrollFun) {
                //如果不是则return掉
                return;
            }
            //恢复自动滚动
            lock.disableAudoScroll = false;
            //定时器个数清零
            lock.controlScrollFun = 0;
        }, 3000);
    }
}
//滚动到对应下标的歌词
//index:滚动到的歌词下标
//isMust:是否必须执行滚动，指定为true时必定执行滚动
const scrollToLrc = function(index:number, isMust:boolean) {
    if (isMust != true) {
        if (props.lrcNowIndex == index) {
            return;
        }
        if (lock.disableAudoScroll) {    //是否允许自动滚动
            return;
        }
    }
    let ulList = <any>cmusic_lyric_ul.value;
    let topWhere = ulList.scrollHeight / props.lrcObj.src.lrc.length * index - ulList.clientHeight * 0.3;
    if (topWhere < 0) {
        topWhere = 0;
    }
    lock.enableListerScroll = false;
    ulList.scrollTo({
        top: topWhere,
        behavior: 'smooth'
    });
    setTimeout(function () {
        lock.enableListerScroll = true;
    }, 300);
}
const lyric_item_click = (item:LyricItem_c) => { 
    emits('item-click', item);
    lock.disableAudoScroll = false;
    lock.controlScrollFun = 0;
}
const focus_click = () => {
    scrollToLrc(props.lrcNowIndex, true);
}
//选择歌词按钮点击
const selectLyric_click = () => {
    popwin_s.open_selectLyric(
        function(in_lrcid:number) {
            emits('select-lyric', in_lrcid);
            popwin_s.closeDetail();
        },
        props.lrcObj.lrcid
    );
}

//向外暴露
defineExpose({
    lry_scrollAndBarrage,
    addLyricBarrageByIndex,
    scrollToLrc
})

</script>

<template>
    <div class="cmusic_displayFlex_class" style="overflow: hidden;">
        <!-- 列表左边的按钮栏 -->
        <div class="cmusic_displayFlexColumn_class cwin_center" style="width:40px">
            <!-- 选择歌词按钮 -->
            <MyBtnVue :shadow="false" :icon="SrcIcon.searchPage" @click="selectLyric_click()" />
            <!-- 歌词定位按钮 -->
            <MyBtnVue :shadow="false" :enable="lrcObj.src.lrc.length > 1" :icon="SrcIcon.position" @click="focus_click()" />
        </div>
        <ul ref="cmusic_lyric_ul" @scroll="scrollListener()" class="cmusic_lyric_ul cmusic_shadow">
            <li class="cmusic_lyric_li" v-for="(item, index) in lrcObj.src.lrc" :key="index">
                <span @click="lyric_item_click(item)"
                    :class="(index == lrcNowIndex)?'cmusic_lyric_li_span_select':'cmusic_lyric_li_span'">
                    {{item.content}}
                </span>
            </li>
        </ul>
         <!-- 列表右边的按钮栏 -->
        <div class="cmusic_displayFlexColumn_class cwin_center" style="width:40px">
        </div>
    </div>
</template>