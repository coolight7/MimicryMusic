<script setup lang="ts">
import { ref, onBeforeUnmount, reactive } from "vue";
import { storeToRefs } from 'pinia'
import { Global_store } from "../../stores/Global";
import { PopWin_store } from "../../stores/popWin/PopWin";
import { AudioLyric_store, Lyric_c, Lyric_access_e, LyricSrc_c } from '../../stores/lyric/Lyric';
import { SrcIcon } from '../../stores/Src';
import ListDetailsVue from '../global/ListDetails.vue';
import MySvg from "../global/MySvg.vue";
import MyBtn from "../global/MyBtn.vue";
import { User_store } from '../../stores/user/User';

const user_s = User_store();
const global_s = Global_store();
const popWin_s = PopWin_store();
const lyric_s = AudioLyric_store();

const cmusic_list = <any>ref(null);

const props = defineProps({
    lists: {
        //歌单列表
        type: Array<Lyric_c>,
        required: true,
    },
    selectLrcid: {
        type: Number,
        default: -1
    },
    enables: {
        //启用功能
        type: Object,
        required: true,
    },
});
//事件信号
const emits = defineEmits({
    "update:lists": null,   // v-model:lists传参
    "list-reload": null,    // 重新网络加载lists信号
    "list-save": null,      // 保存修改信号
    "list-beforeAdd": (event) => {
        if (event) {
            return true;
        } else {
            console.warn("Lists.vue: 事件'list-beforeAdd'所绑定的函数未接收关键参数");
            return true;
        }
    },
    "item-click": (item:Lyric_c) => {
        if (item) {
            return true;
        } else {
            console.warn("Lists.vue: 事件'item-click'所绑定的函数未接收关键参数");
            return true;
        }
    },
    "items-remove": (selectlists:Array<Lyric_c>) => {
        if (selectlists) {
            return true;
        } else {
            console.warn("事件'items-remove'所绑定的函数未接收关键参数");
            return true;
        }
    },
});
let mValue = reactive({
    lists_checked: new Array<number>(), //列表选中的下标数组
    list_cache: new Array<Lyric_c>()   //暂存修改前的备份
});


const lists_item_click = (item: Lyric_c) => {
    emits("item-click", item);
};

const edit_save_click = () => {
    emits("list-save");
};

const addLyric_click = () => {
    let event = global_s.getTemp_event();
    emits("list-beforeAdd", event);
    if (!event.isTodo()) {
        return;
    }
    popWin_s.open_addLyric((in_lyric:Lyric_c) => {
        lyric_s.post_add_create_lyric(in_lyric);
        popWin_s.closeDetail();
        setTimeout(function () {
            cmusic_list.value.focus_item(props.lists.length - 1);
        }, 300);
    });
}
const removeLyric_click = (in_checkedList: Array<number>) => {
    let check_len = in_checkedList.length;
    if (check_len == 0) {
        global_s.tip("请先选择要删除的歌词");
        return;
    }
    let nameList = "",
        selectlists = [];
    let lrclist = props.lists;
    for (let i = check_len; i-- > 0;) {
        nameList += lrclist[in_checkedList[i]].name + "\n";
        selectlists.push(lrclist[in_checkedList[i]]);
    }
    if (confirm("是否确认把以下歌词删除？\n\n" + nameList)) {
        //确认删除
        //先将checkList存的下标排序(从小到大)
        in_checkedList.sort(function (x, y) {
            if (x < y) return -1;
            else if (x > y) return 1;
            else return 0;
        });
        //从大到小移除列表
        for (let i = check_len; i--;) {
            lrclist.splice(in_checkedList[i], 1);
        }
        emits("items-remove", selectlists);
    }
}
const editLyric_click = (in_item:Lyric_c) => {
    popWin_s.open_editLyric(function(to_item:Lyric_c) {
        lyric_s.post_set_create_info(to_item);
        popWin_s.closeDetail();
    }, in_item);
}
const lyricLike_click = (in_item:Lyric_c) => {
    lyric_s.lyric_like_click(in_item);
}

const update_lists = (in_list:Array<Lyric_c>) => {
    emits('update:lists', in_list);
}
const update_listCache = (in_list:Array<Lyric_c>) => {
    mValue.list_cache = new Array<Lyric_c>();
    in_list.forEach((value, index, array) => {
        mValue.list_cache.push(value.copyWith());
    });
}

const { getUserCid } = storeToRefs(user_s);

const list_key = (in_item:Lyric_c) => {
    return in_item.lrcid;
}
const selected = (in_item:Lyric_c) => {
    return (props.selectLrcid == in_item.lrcid);
}

</script>

<template>
    <ListDetailsVue 
        ref="cmusic_list"
        :list="props.lists"
        @update:list="update_lists"
        :list-cache="mValue.list_cache"
        @update:list-cache="update_listCache"
        :enable="props.enables"
        :check-box="true"
        :list-key="list_key"
        :selected="selected"
        :transform-x="false"
        @item-click="lists_item_click"
        @add-item="addLyric_click"
        @remove-item="removeLyric_click"
        @list-save="edit_save_click">
        <template #info="{item}">
            <span class="cmusic_li_name" style="font-weight: bold">{{ (<Lyric_c>item).name }}</span>
            <span class="cmusic_li_artist">{{ (<Lyric_c>item).lrcid }}</span>
        </template>
        <template #tags="{item}">
            <span v-if="(<Lyric_c>item).access == Lyric_access_e.Private">私密</span>
            <span v-else-if="(<Lyric_c>item).access == Lyric_access_e.Public">公开</span>
        </template>
        <template #editButton="{item}">
        </template>
        <template #interactButton="{item}">
            <div v-if="props.enables.item.edit && (<Lyric_c>item).uid == getUserCid">
                <my-btn @click="editLyric_click((<Lyric_c>item))" :icon="SrcIcon.edit" :shadow="false" />
            </div>
            <div v-if="props.enables.item.interact && (<Lyric_c>item).uid != getUserCid"
                class="cmusic_displayFlex_class" style="width: auto">
                <button @click="lyricLike_click((<Lyric_c>item))"
                    class="cmusic_control_btn_noShadow cmusic_btn_span">
                    <my-svg v-if="(<Lyric_c>item).islove" :name="SrcIcon.like_l" />
                    <my-svg v-else :name="SrcIcon.like_d" />
                    <span>{{ (<Lyric_c>item).love }}</span>
                </button>
            </div>
        </template>
    </ListDetailsVue>
</template>