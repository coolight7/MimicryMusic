<script setup lang="ts">
import { SrcIcon } from '../../stores/Src';
import { ref, reactive, onBeforeUnmount, onMounted, watch } from 'vue';
import { Enable_ListDetails_c } from "../../stores/global/GlobalComp"
import ListVue from './List.vue';
import CheckboxRectVue from './CheckboxRect.vue';
import MySvg from './MySvg.vue';
import MyBtn from "./MyBtn.vue";

const cmusic_list = <any>ref(null);
/* 需要子组件 v-model:list 
*  若支持修改，则需要 v-model:listCache
*/
const props = defineProps({
    enable:{
        type:Object,
        default: new Enable_ListDetails_c()
    },
    list: {
        type: Array<Object>,
        required: true
    },
    listCache:{
        type:Array<Object>,
        default: new Array<Object>
    },
    listKey: {               //用于排序的对象内的值名称
        type: Function,
        default: (in_item:Object, in_index:number) => { return 0; }
    },
    selected: {              //选中判断条件
        type:Function,
        default:(in_item:Object, in_index:number) => { return false; }
    },
    checkBox:{            //是否启用复选框
        type:Boolean,
        default:false
    },
    transformX:{
        type:Boolean,
        default:true
    },
    focusShift:{
        type:Number,
        default:0
    },
})

const emits = defineEmits({
    'itemClick':(in_item:any, in_index:number) => {
        if(!in_item) {
            console.warn("ListDetails.vue: 事件 'itemClick' 所绑定的函数未接收关键参数");
        }
        return true;
    },
    'update:listCache':(in_list:Array<any>) => {
        if(!in_list) {
            console.warn("ListDetails.vue: 事件 'update:listCache' 所绑定的函数未接收关键参数");
        }
        return true;
    },
    'update:list':(in_list:Array<any>) => {
        if(!in_list) {
            console.warn("ListDetails.vue: 事件 'update:list' 所绑定的函数未接收关键参数");
        }
        return true;
    },
    'addItem':null,
    'removeItem':(in_checkedList:Array<number>) => {
        if(!in_checkedList) {
            console.warn("ListDetails.vue: 事件 'removeItem' 所绑定的函数未接收关键参数");
        }
        return true;
    },
    'list-save':null        //发起信号，希望子组件发起请求等方式保存
})

let mValue = reactive({
    enable:props.enable,
    isEdit:false,
    isEdit_change:false,
    checkedList:new Array<number>()
})

//点击事件
const item_click = (in_item:Object, in_index:number) => {
    if (mValue.isEdit) {
        //编辑模式禁用点击按钮
        return;
    }
    emits('itemClick', in_item, in_index);
}

//离开编辑，把相关值恢复
const edit_leave = () => {
    mValue.isEdit = false;
    mValue.isEdit_change = false;
    mValue.checkedList.length = 0;
};
//点击编辑按钮，进入编辑
const edit_click = () => {
    mValue.isEdit = true;
    emits('update:listCache', props.list);
}
//保存修改
const edit_save_click = () => {
    if (mValue.isEdit_change) {
        emits("list-save");
    }
    edit_leave();
}
//取消保存
const edit_cancle_click = (isTip: boolean) => {
    if (mValue.isEdit_change) {
        if (isTip != false && !confirm("是否放弃修改？")) {
            return;
        }
        emits("update:list", props.listCache);
    }
    edit_leave();
};
//离开编辑播放列表，询问是否保存修改
const edit_leave_click = () => {
    if (mValue.isEdit) {
        //如果正在编辑中
        if (mValue.isEdit_change && confirm("是否保存修改？")) {
            edit_save_click();
        } else {
            edit_cancle_click(false);
        }
    }
};

const addItem_click = () => {
    emits('addItem');
}
const removeItem_click = () => {
    emits('removeItem', mValue.checkedList);
}
const focus_item = (in_index:number) => {
    cmusic_list.value.focus_item(in_index);
}
const focus_click = () => {
    let index = props.list.length;
    for(; index-- > 0; ) {
        if(props.selected(props.list[index], index)) {
            break;
        }
    }
    if(index >= 0) {
        focus_item(index);
    } else {
        return;
    } 
}
//全选按钮
const checkAll = () => {
    if(mValue.checkedList.length === props.list.length) {   //已经全选
        mValue.checkedList.length = 0;
    } else {
        mValue.checkedList.length = 0;
        for(let i  = props.list.length; i-- > 0;) {
            mValue.checkedList.push(i);
        }
    }
}
const checkedList_clear = () => {
    mValue.checkedList = [];
}
const set_isEdit_change = (in_bool:boolean) => {
    mValue.isEdit_change = in_bool;
}
const set_isEdit = (in_bool:boolean) => {
    mValue.isEdit = in_bool;
}

onBeforeUnmount(() => {
    edit_leave_click();
});

onMounted(() => {
    watch(() => <Enable_ListDetails_c>(props.enable),
        (in_enable:Enable_ListDetails_c) => {
            mValue.enable = in_enable;
        }
    )
})

defineExpose({
    focus_item,
    checkedList_clear,
    set_isEdit_change,
    set_isEdit
})

</script>

<template>
<div class="cmusic_displayFlex_class" style="width: 100%; overflow: hidden; height: auto">
    <!-- 列表左边的按钮栏 -->
    <div class="cmusic_displayFlexColumn_class cwin_center" style="width: 40px">
        <!-- 多选/编辑按钮 -->
        <button v-show="props.enable.array.edit && !mValue.isEdit" @click="edit_click()"
            class="cmusic_control_btn_noShadow">
            <my-svg :name="SrcIcon.multiple" />
        </button>
        <!-- 是否保存 按钮 -->
        <div v-show="mValue.isEdit" class="cmusic_displayFlexColumn_class cmusic_ul_btnList" style="width: auto">
            <!-- 确定保存 -->
            <my-btn :shadow="mValue.isEdit_change" :checked="mValue.isEdit_change" :icon="SrcIcon.right"
                @click="edit_save_click()" />
            <!-- 取消保存 -->
            <my-btn :shadow="mValue.isEdit_change" :checked="mValue.isEdit_change" :icon="SrcIcon.cancle"
                @click="edit_cancle_click(true)" />
            <!-- 创建播放列表按钮 -->
            <my-btn v-show="props.enable.array.add" :shadow="false" :icon="SrcIcon.addition" @click="addItem_click()" />
            <!-- 删除播放列表按钮 -->
            <my-btn v-show="props.enable.array.delete" :enable="mValue.checkedList.length > 0" :shadow="false"
                :icon="SrcIcon.subtract" @click="removeItem_click()" />
            <CheckboxRectVue :checked="props.list.length > 0 && mValue.checkedList.length === props.list.length" 
                :enable="props.list.length > 0"
                @click="checkAll()" />
        </div>
        <!-- 歌曲定位按钮 -->
        <my-btn v-if="props.enable.array.focus" 
            @click="focus_click()" 
            :icon="SrcIcon.position" 
            :shadow="false"
            :enable="props.list.length > 0" />
    </div>
    <!-- 列表 -->
    <ListVue 
        ref="cmusic_list"
        :list="props.list" 
        :check-box="props.checkBox" 
        :checked-list="mValue.checkedList"
        :list-key="props.listKey"
        :selected="props.selected" 
        :enable-edit="mValue.isEdit" 
        :transform-x="props.transformX"
        :focus-shift="props.focusShift"
        @item-click="item_click" 
        @edit-change="mValue.isEdit_change = true"
        style="flex: 1;">
        <template #img="{item, index}">
            <slot name="img" :item="item" :index="index"></slot>
        </template>
        <template #info="{item, index}">
            <slot name="info" :item="item" :index="index"></slot>
        </template>
        <template #tags="{item, index}">
            <slot name="tags" :item="item" :index="index"></slot>
        </template>
        <template #button="{item, index}">
            <div v-show="props.enable.item.edit && mValue.isEdit">
                <slot name="editButton" :item="item" :index="index"></slot>
            </div>
            <div v-show="props.enable.item.interact && !mValue.isEdit">
                <slot name="interactButton" :item="item" :index="index"></slot>
            </div>
        </template>
    </ListVue>
    <div style="width: 40px;"></div>
  </div>
</template>
