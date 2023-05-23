<script setup lang="ts">
import { reactive, ref, onMounted, watch } from "vue";
import { storeToRefs } from 'pinia';
import { PopWin_store } from "../../stores/popWin/PopWin";
import { Global_store } from "../../stores/Global";
import { LyricItem_c, Lyric_c } from '../../stores/lyric/Lyric';
import { Audio_store } from "../../stores/audio/Audio";
import { SrcIcon } from "../../stores/Src";
import ListDetailsVue from "../global/ListDetails.vue";
import MyBtn from "../global/MyBtn.vue";

const popWin_s = PopWin_store();
const global_s = Global_store();
const audio_s = Audio_store();

const cmusic_list = <any>ref(null);

const {
    playing
} = storeToRefs(audio_s);

const props = defineProps({
    lrcObj: {
        type: Object,
        required: true
    }
})

let mValue = reactive({
    lrcObj: <Lyric_c>props.lrcObj,
    hoverIndex: -1,
    playIndex: 0,
    list_cache: new Array<LyricItem_c>()
})


//事件信号
const emits = defineEmits({
    'save': (list) => {
        if (list) {
            return true;
        } else {
            console.warn("LyricEdit.vue: 事件 'save' 所绑定的函数未接收关键参数");
            return true;
        }
    }
})

const start_click = () => {
    audio_s.play_click();
}

const audioPlay = (index: number) => {
    audio_s.audioPlayer.currentTime = mValue.lrcObj.src.lrc[index].get_time();
}

const focus_click = () => {
    cmusic_list.value.focus_item(mValue.playIndex);
}
//敲入时间
const insertTime = () => {
    let lrcarr = mValue.lrcObj.src.lrc;
    if (isNaN(audio_s.audioPlayer.currentTime)
        || lrcarr.length === 0
        || mValue.playIndex >= lrcarr.length) {
        return;
    }
    lrcarr[mValue.playIndex].set_time(audio_s.audioPlayer.currentTime);
    cmusic_list.value.set_isEdit_change(true);
    ++(mValue.playIndex);
    cmusic_list.value.focus_item(mValue.playIndex);
}
//下载歌词文件
const downLyric = () => {
    let lrcStr = "", lrclist = mValue.lrcObj.src.lrc;
    for (let i = 0, len = lrclist.length; i < len; ++i) {
        lrcStr += "[" + lrclist[i].get_timeStr() + "]" + lrclist[i].content + "\n";
    }
    let aTag = document.createElement('a');
    let blob = new Blob([lrcStr]);
    aTag.download = "歌词.lrc";
    aTag.href = URL.createObjectURL(blob);
    aTag.click(); // 模拟点击
    blob.text().then(data => {
        URL.revokeObjectURL(data);
    }).catch(err => { });
}
//保存歌词
const saveLyric = () => {
    emits('save', mValue.lrcObj.src.lrc);
}
const edit_save_click = () => {
    update_listCache(<Array<LyricItem_c>>(mValue.lrcObj.src.lrc));
}
//添加歌词
const add_click = () => {
    popWin_s.open_addLyricSrc((in_lrc: Array<LyricItem_c>) => {
        let list = mValue.lrcObj.src.lrc;
        if (list.length === 0) {
            mValue.lrcObj.src.lrc = in_lrc;
        } else {
            //插入数据
            if (list.length >= in_lrc.length) {
                let position = mValue.playIndex + 1;
                if (position > list.length) {
                  position = list.length;
                }
                for (let i = in_lrc.length; i-- > 0;) {
                    list.splice(position, 0, in_lrc[i]);
                }
            } else {
                let i = list.length;
                for (let left = mValue.playIndex + 1; i-- > left;) {
                    in_lrc.push(<LyricItem_c>list[i]);
                }
                for (; i >= 0; i--) {
                    in_lrc.unshift(<LyricItem_c>list[i]);
                }
                mValue.lrcObj.src.lrc = in_lrc;
            }
        }
        cmusic_list.value.set_isEdit_change(true);
        popWin_s.closeDetail();
    })
}
//删除歌词
const remove_click = (in_checkedList: Array<number>) => {
    let checkList = in_checkedList;
    let check_len = checkList.length;
    if (check_len == 0) {
        global_s.tip("请先选择歌词");
        return;
    }
    let nameList = "";
    let lrcarr = mValue.lrcObj.src.lrc;
    for (let i = check_len; i-- > 0;) {
        nameList += lrcarr[checkList[i]].content + "\n";
    }
    if (confirm("是否确认把以下歌词移除？\n\n" + nameList)) {
        //确认删除
        //先将checkList存的下标排序(从小到大)
        checkList.sort(function (x, y) {
            if (x < y)
                return -1;
            else if (x > y)
                return 1;
            else
                return 0;
        });
        //从大到小移除
        for (let i = check_len; i--;) {
            lrcarr.splice(checkList[i], 1);
        }
        //清空选择
        cmusic_list.value.set_isEdit_change(true);
    }
}

const audio_shift = (in_num: number) => {
    audio_s.audio_play_shift(in_num);
}
const update_listCache = (in_list: Array<LyricItem_c>) => {
    mValue.list_cache = new Array<LyricItem_c>();
    for (let i = 0, len = in_list.length; i < len; ++i) {
        mValue.list_cache.push(new LyricItem_c(in_list[i].get_time(), in_list[i].content));
    }
}
const update_lrcObj = (in_lrcObj: Lyric_c) => {
    mValue.lrcObj = in_lrcObj;
}
update_listCache(<Array<LyricItem_c>>(mValue.lrcObj.src.lrc));

const lrcObj_isAvailable = () => {
    return (mValue.lrcObj.lrcid > 0);
}

const list_key = (in_item: LyricItem_c) => {
    return (in_item.get_time() + in_item.content);
}
const selected = (in_item: LyricItem_c, index: number) => {
    return (mValue.playIndex == index);
}

const set_isEdit_change = (in_bool: boolean) => {
    cmusic_list.vlaue.set_isEdit_change(in_bool);
}

onMounted(() => {
    watch(
        () => <Lyric_c>props.lrcObj,
        update_lrcObj
    )
})

defineExpose({
    update_listCache
})

</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <span v-show="mValue.lrcObj.src.lrc.length === 0" class="cmusic_tipSpan_commend">点击左边的 + 添加歌词吧</span>
        <ListDetailsVue 
            ref="cmusic_list" 
            v-model:list="mValue.lrcObj.src.lrc" 
            :list-cache="mValue.list_cache"
            @update:list-cache="update_listCache" 
            :check-box="true" 
            :list-key="list_key" 
            :selected="selected"
            :transform-x="false"
            :focus-shift="-2"
            :width-all-info="'90%'"
            :width-info-tag="'100%'"
            @add-item="add_click" 
            @remove-item="remove_click" 
            @list-save="edit_save_click">
            <template #info="{ item }">
                <div class="cmusic_displayFlex_class" style="height: 100%;">
                    <input :value="(<LyricItem_c>item).get_timeStr()" @change="set_isEdit_change(true)"
                        class="cmusic_lyricEdit_time" type="text" />
                    <input :value="(<LyricItem_c>item).content" @change="set_isEdit_change(true)"
                        class="cmusic_lyricEdit_content" type="text" />
                </div>
            </template>
            <template #interactButton="{ item, index }">
                <div style="width: 60px; justify-self: start;">
                    <div class="cwin_center">
                        <my-btn :shadow="false" :icon="SrcIcon.location" @click="mValue.playIndex = index" />
                        <my-btn :shadow="false" :icon="SrcIcon.playMedia_hollow" @click="audioPlay(index)" />
                    </div>
                </div>
            </template>
        </ListDetailsVue>
        <div class="cmusic_displayFlex_class cwin_center" style="margin-bottom: 10px;">
            <my-btn text="-5s" :icon="SrcIcon.pointDoubleLeft" @click="audio_shift(-5)" />
            <my-btn @click="start_click()" :checked="playing" :t-icon="SrcIcon.stopMedia" :f-icon="SrcIcon.playMedia"
                t-text="暂停" f-text="开始" />
            <my-btn text="+5s" :icon="SrcIcon.pointDoubleRight" @click="audio_shift(5)" />
        </div>
        <div class="cmusic_displayFlex_class cwin_center">
            <my-btn @click="saveLyric()" :icon="SrcIcon.saveFile_d" :enable="lrcObj_isAvailable()" text="保存" />
            <my-btn v-show="playing" @click="insertTime()" :icon="SrcIcon.selectClock" text="敲入时间" />
            <my-btn @click="downLyric()" :icon="SrcIcon.download" :enable="mValue.lrcObj.src.lrc.length > 0"
                text="下载" />
        </div>
    </div>
</template>