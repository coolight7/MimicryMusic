<script setup lang="ts">
import { reactive } from "vue";
import { Lyric_c, AudioLyric_store } from '../../stores/lyric/Lyric';
import { Search_store } from "../../stores/search/Search"; 
import { Global_store } from "../../stores/Global";
import { Url_store } from "../../stores/Url";
import { SrcIcon } from "../../stores/Src";
import PopWinBase from "./PopWinBase.vue";
import CtrlListVue from "../lyric/CtrlList.vue";
import SelectLineVue from '../global/SelectLine.vue';
import MyBtnVue from "../global/MyBtn.vue";

const search_s = Search_store();
const url_s = Url_store();
const lyric_s = AudioLyric_store();
const global_s = Global_store();

const props = defineProps({
    selectedLrcid:{
        type:Number,
        default:-1
    }
});

const emits = defineEmits({
    'select':(in_lrcid:number) => {
        if(in_lrcid) {
            return true;
        } else {
            console.log("EditLyric.vue: 事件 'save' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    "cancle":null
})

let mValue = reactive({
    showType:true,             //true:我的， false:搜索
    lyric: new Lyric_c(),
    list: lyric_s.lrcList,
    searchStr: "",
    enable:{
        array: {
            edit: false,
            add: false,       //创建
            order: false,     //排序
            delete: false,    //移除
        },
        item: {
            edit: false,        //编辑
            interact: true,     //互动
        },
    }
});
mValue.lyric.lrcid = props.selectedLrcid;

//选择显示的选择歌词类型（我的 / 搜索）
const showType_click = (in_bool:boolean) => {
    if(mValue.showType == in_bool) {
        return;
    }
    mValue.showType = in_bool;
    if(in_bool == true) {   //我的
        mValue.list = lyric_s.lrcList;
    } else {        //搜索
        mValue.list = new Array<Lyric_c>();
    }
}
const item_click = (in_lyric:Lyric_c) => {
    mValue.lyric = in_lyric;
}
const search_result_click = async () => {
    if(!/[^\s\'\"\\.*?]+/.test(mValue.searchStr)) {
        global_s.tip("搜索字符内容无效");
        return;
    }
    const relist = await search_s.post_search_lyric(
        mValue.searchStr,
        true);
    if(null != relist) {
        if(relist.length > 0) {
            mValue.list = relist;
        }
        // 无搜索结果
    } else {
        global_s.tip("查询失败");
    }
}
const input_search = (e:any) => {
    if(e.keyCode == 13) {
        search_result_click();
    }
}

const saveList_click = () => {
    emits('select', mValue.lyric.lrcid);
}
const cancle_click = () => {
    emits('cancle');
}
const btnlist = [
    {
        isShow: true,
        str: "选择",
        fun: saveList_click
    },
    {
        isShow: true,
        str: "取消",
        fun: cancle_click
    }
]

</script>

<template>
    <PopWinBase title="选择歌词" :f-btns="btnlist">
        <div class="cwin_displayFlexColumn" style="height:400px">
            <div class="cwin_displayFlex" style="height:60px">
                <SelectLineVue text="我的" :selected="mValue.showType" @click="showType_click(true)" />
                <SelectLineVue text="搜索" :selected="!mValue.showType" @click="showType_click(false)" />
            </div>
            <div class="cwin_displayFlex" v-show="!mValue.showType" >
                <input class="cmusic_user_sign_div_input" 
                    v-model="mValue.searchStr" 
                    type="text"
                    placeholder="搜索歌词"
                    @keydown="input_search($event)">
                <MyBtnVue :f-icon="SrcIcon.search_l" 
                    :shadow="false" 
                    @click="search_result_click()" 
                    style="fill:#66ccff;margin: 0px;" />
            </div>
            <CtrlListVue :lists="<Array<Lyric_c>>(mValue.list)" 
                :select-lrcid="mValue.lyric.lrcid" 
                :enables="mValue.enable"
                @item-click="item_click"
                style="height:250px" />
        </div>
    </PopWinBase>
</template>