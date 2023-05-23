<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ContainTopBar_store } from '../../stores/contain/ContainTopBar';
import { ContainBar_store } from '../../stores/contain/ContainBar';
import { ContainFunBar_store }  from "../../stores/contain/ContainFunBar";
import { Search_store } from "../../stores/search/Search";
import { SrcIcon } from '../../stores/Src';
import MyBtn from "../global/MyBtn.vue"

const containBar_s    = ContainBar_store();
const containFunBar_s = ContainFunBar_store();
const containTopBar_s = ContainTopBar_store();
const search_s        = Search_store();
const router          = useRouter();

const {
    isShow,
} = storeToRefs(containTopBar_s);

const showPosition = (index:number) => {
    if(index == containTopBar_s.isShow.position_index) {
        containTopBar_s.closeAll();
        router.back();
    }else {
        switch(index) {
            case 0:{
                router.push({
                    path:'/search'
                })
            }break;
        }
    }
}
const containBar_click = () => {
    if(containBar_s.isShow.detail) {
        containBar_s.closeDetail();
    } else {
        containBar_s.showDetail();
    }
}
const containFunBar_click = () => {
    if(containFunBar_s.isShow.detail) {
        containFunBar_s.closeDetail();
    } else {
        containFunBar_s.showDetail();
    }
}
const input_search = (e:any) => {
    if(e.keyCode == 13) {
        search_result_click();
    }
}
const search_result_click = () => { search_s.search_result_click(); } 

</script>

<template>
    <div class="cmusic_containTopBar cmusic_displayFlex_class cwin_center">
        <!-- 控制是否显示左侧导航栏 -->
        <MyBtn :checked="containBar_s.isShow.detail" :t-icon="SrcIcon.menuLeft_l" :f-icon="SrcIcon.menuLeft_d" @click="containBar_click()" />
        <!-- 搜索按钮 -->
        <div :class="['cmusic_search_div',{'cmusic_search_div_active':(isShow.position_index == 0)}]">
            <MyBtn :checked="isShow.position_index == 0" t-icon="search_l" f-icon="search_l" @click="showPosition(0)" style="margin:0px;" />
            <input class="cmusic_search_input" accesskey="/" v-show="(isShow.position_index == 0)" v-model="search_s.str" type="text"
                :placeholder="search_s.placeStr"
                @keydown="input_search($event)">
            <MyBtn v-show="(isShow.position_index == 0)" f-icon="search_l" :shadow="false" @click="search_result_click()" style="fill:#66ccff;" />
        </div>
        <!-- 控制是否显示右侧导航栏 -->
        <MyBtn :checked="containFunBar_s.isShow.detail" :t-icon="SrcIcon.menuRight_l" :f-icon="SrcIcon.menuRight_d" @click="containFunBar_click()" />
    </div>
</template>