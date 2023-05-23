<script setup lang="ts">
import { reactive, ref, onMounted, watch } from "vue";
import { storeToRefs } from 'pinia';
import { MyScript_store, MyScript_c, MyScriptItem_c } from "../../stores/myscript/MyScript";
import { PopWin_store }     from "../../stores/popWin/PopWin";
import { Audio_store }      from "../../stores/audio/Audio";
import { Global_store }     from "../../stores/Global";
import { SrcIcon } from '../../stores/Src';
import MyBtn from "../global/MyBtn.vue";
import ListDetailsVue from "../global/ListDetails.vue";

const popWin_s = PopWin_store();
const global_s = Global_store();
const audio_s  = Audio_store();

const cmusic_list = <any>ref(null);

const props = defineProps({
    scriptObj: {
        type: MyScript_c,
        required: true
    }
})

const emits = defineEmits({
    'save': (list) => {
        if (list) {
            return true;
        } else {
            console.warn("ScriptEdit.vue: 事件 'save' 所绑定的函数未接收关键参数");
            return true;
        }
    }
})

const {
    playing
} = storeToRefs(audio_s);

let mValue = reactive({
    scriptObj: props.scriptObj,
    checklist: new Array<number>(),
    playIndex: 0,
    list_cache : new Array<MyScriptItem_c>()
})

const update_listCache = (in_list:Array<MyScriptItem_c>) => {
    mValue.list_cache = new Array<MyScriptItem_c>();
    for(let i = 0, len = in_list.length;i < len; ++i) {
        mValue.list_cache.push(new MyScriptItem_c(in_list[i].get_time(), in_list[i].code));
    }
}

const edit_save_click = () => {
    update_listCache(<Array<MyScriptItem_c>>(mValue.scriptObj.src));
}
const add_click = () => {
    popWin_s.open_addScriptSrc((in_arr:Array<MyScriptItem_c>) => {
        console.log(in_arr);
    });
}
const remove_click = () => {

}
//保存歌词
const saveScript = () => {
    emits('save', mValue.scriptObj.src);
}

const audio_shift = (in_num: number) => {
    audio_s.audio_play_shift(in_num);
}
const start_click = () => {
    audio_s.play_click();
}
const audioPlay = (index: number) => {
    audio_s.audioPlayer.currentTime = mValue.scriptObj.src[index].get_time();
}
//敲入时间
const insertTime = () => {
    let arr = mValue.scriptObj.src;
    if (isNaN(audio_s.audioPlayer.currentTime)
        || arr.length === 0
        || mValue.playIndex >= arr.length) {
        return;
    }
    arr[mValue.playIndex].set_time(audio_s.audioPlayer.currentTime);
    cmusic_list.value.set_isEdit_change(true);
    ++(mValue.playIndex);
    cmusic_list.value.focus_item(mValue.playIndex);
}
const srciptObj_isAvailable = () => {
    return (mValue.scriptObj.msid > 0);
}

const update_scriptObj = (in_scriptObj: MyScript_c) => {    //TODO
    mValue.scriptObj = in_scriptObj;
}
const list_key = (in_item:MyScript_c) => {
    return in_item.msid;
}
const selected = (in_item: MyScript_c, index: number) => {
    return (mValue.playIndex == index);
}
const set_isEdit_change = (in_bool: boolean) => {
    cmusic_list.vlaue.set_isEdit_change(in_bool);
}

onMounted(() => {
    watch(
        () => <MyScript_c>props.scriptObj,
        update_scriptObj
    )
})


</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <span v-show="mValue.scriptObj.src.length === 0" class="cmusic_tipSpan_commend">点击左边的 + 添加任务吧</span>
        <ListDetailsVue 
            ref="cmusic_list" 
            v-model:list="mValue.scriptObj.src" 
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
                    <input :value="(<MyScriptItem_c>item).get_timeStr()" @change="set_isEdit_change(true)"
                        class="cmusic_lyricEdit_time" type="text" />
                    <span class="cmusic_lyricEdit_content">
                        {{ (<MyScriptItem_c>item).get_codeStr() }}
                    </span>
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
            <my-btn @click="saveScript()" :icon="SrcIcon.saveFile_d" :enable="srciptObj_isAvailable()" text="保存" />
            <my-btn v-show="playing" @click="insertTime()" :icon="SrcIcon.selectClock" text="敲入时间" />
        </div>
    </div>
</template>
