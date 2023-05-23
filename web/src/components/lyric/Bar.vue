<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { toRefs } from "vue"
import { AudioLyric_store, Lyric_c } from '../../stores/lyric/Lyric';
import { SrcIcon } from '../../stores/Src';
import MyBtn from '../global/MyBtn.vue';
const lyric_s = AudioLyric_store();

const {
    
} = storeToRefs(lyric_s);

const props = defineProps({
    lrc:{
        type:Object,
        required:true
    },
    showPoint:{
        type:Boolean,
        required:true
    }
})
const emits = defineEmits({
    'show-type-click':null
});

const {
    lrc,
    showPoint
} = toRefs(props);

const showType_click = () => {
    emits('show-type-click');
} 

</script>

<template>
    <div class="cmusic_displayFlex_class" style="width: auto;height:40px;">
        <!-- 选择列表的显示内容按钮 -->
        <my-btn :checked="showPoint" :t-icon="SrcIcon.pointDown_large" :f-icon="SrcIcon.nextPoint" @click="showType_click()" />
        <!-- 选择的歌词列表信息 -->
        <div style="display:flex; flex-direction:column; margin-right: 10px;">
            <span style="color:#75738e;font-size:large;font-weight:bold;">{{ lrc.name }}</span>
            <span v-show="lrc.lrcid > 0" style="color:#75738e;font-size:smaller;">{{ lrc.lrcid }}</span>
        </div>
    </div>
</template>