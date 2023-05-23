<script setup lang="ts">
import { ref } from "vue";
import { SrcIcon } from "../../stores/Src";
import CheckboxRect from "./CheckboxRect.vue";
import ListBaseVue from "./ListBase.vue";
import MyBtn from "./MyBtn.vue";

const cmusic_list = <any>ref(null);

const props = defineProps({
    enableEdit:{
        type:Boolean,
        default:false
    },
    list: {
        type: Array<Object>,
        required: true
    },
    listKey: {               //用于排序的对象内的值名称
        type: Function,
        default: () => { return 0; }
    },
    selected: {              //选中判断条件
        type:Function,
        default:() => { return false; }
    },
    checkBox:{            //是否启用复选框
        type:Boolean,
        default:false
    },
    checkedList:{
        type:Array<number>,
        default:[]
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
    'editChange':null,    //修改时触发
    'itemClick':(in_item:Object, in_index:number) => {
        if(!in_item) {
            console.warn("List.vue: 事件 'itemClick' 所绑定的函数未接收关键参数");
        }
        return true;
    }
})

const editChange = () => {
    emits('editChange');
}

const lists_item_click = (in_item:Object, in_index:number) => {
    emits('itemClick', in_item, in_index);
}
const check_click = (in_index:number) => {
    let result = props.checkedList.indexOf(in_index);
    if (result < 0) {
        //不存在index
        props.checkedList.push(in_index);
    } else {
        props.checkedList.splice(result, 1);
    }
}

const focus_item = (in_index:number) => {
    cmusic_list.value.focus_item(in_index);
}

defineExpose({
    focus_item
})

</script>

<template>
    <ListBaseVue 
        ref="cmusic_list"
        :list="props.list" 
        :enable-edit="props.enableEdit"
        :list-key="props.listKey" 
        :selected="props.selected"
        :transform-x="props.transformX"
        :focus-shift="props.focusShift"
        @edit-change="editChange">
        <template #item="{ item, index }">
            <div style="width: 100%; display: flex; justify-content: space-between">
                <div :style="{ display: 'flex', marginRight: '10px', flex:1, }">
                    <my-btn v-show="props.enableEdit" :icon="SrcIcon.sort" :shadow="false" style="margin-left: 0px;margin-right: 0px;" />
                    <slot name="img" :item="item" :index="index"></slot>
                    <div @click="lists_item_click(item, index)" class="cmusic_playList_title" style="margin-right: 20px;">
                        <slot name="info" :item="item" :index="index"></slot>
                    </div>
                    <div class="cmusic_lists_tag" style="display:flex; justify-content:start;">
                        <!-- 标签 -->
                        <slot name="tags" :item="item" :index="index"></slot>
                    </div>
                </div>
                <!-- 列表项按钮 -->
                <div style="display: flex;width: auto;height: 50px; justify-self:end;align-self: end; align-items: center;">
                        <slot name="button" :item="item" :index="index"></slot>
                    <!-- 复选框 -->
                    <div v-show="props.checkBox && props.enableEdit" style="display: flex; width: auto; height: auto">
                        <checkbox-rect :checked="props.checkedList.indexOf(index) >= 0"
                            @click="check_click(index)" />
                    </div>
                </div>
            </div>
        </template>
    </ListBaseVue>
</template>
