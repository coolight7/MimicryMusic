<script setup lang="ts">
import { ref, reactive } from "vue";
const props = defineProps({
    enableEdit: {
        type: Boolean,
        default: false
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
    transformX:{
        type:Boolean,
        default:false,
    },
    focusShift:{
        type:Number,
        default:0
    }
})

const emits = defineEmits({
    'editChange': null    //修改时触发
})

const cmusic_list_ul = <any>ref(null);

let dragIndex = 0; //排序时使用的下标

const lists_orderEnd = () => {
    emits('editChange');
};
const lists_dragenter = ($event: any, index: number) => {
    $event.preventDefault();
    // 避免源对象触发自身的dragenter事件
    if (dragIndex !== index) {
        const moving_song = props.list[dragIndex];
        props.list.splice(dragIndex, 1);
        props.list.splice(index, 0, moving_song);
        // 排序变化后目标对象的索引变成源对象的索引
        dragIndex = index;
    }
};
const lists_dragover = ($event: any, index: number) => {
    $event.preventDefault();
};
const lists_dragstart = (index: number) => {
    dragIndex = index;
};

//滚动到对应百分比位置
const focus_item = (in_index: number) => {
    let ul = cmusic_list_ul.value.$el;
    let topLen = ul.scrollHeight / props.list.length * (in_index + props.focusShift);
    if (topLen < 0) {
        topLen = 0;
    }
    ul.scrollTo({
        top: topLen,
        behavior: 'smooth'
    });
}

defineExpose({
    focus_item
})

</script>

<template>
    <div>
        <div v-show="props.list.length == 0" style="display: flex;align-items: center;justify-content: center;height: 100px;">
            <span class="cmusic_li_name" style="font-weight: bold">空空如也</span>
        </div>
        <transition-group v-show="props.list.length > 0" ref="cmusic_list_ul" name="playlist_drag" class="cmusic_playList_ul cmusic_shadow" tag="ul">
            <li :draggable="props.enableEdit" @dragenter="lists_dragenter($event, index)"
                @dragover="lists_dragover($event, index)" @dragstart="lists_dragstart(index)" @dragend="lists_orderEnd()"
                v-for="(item, index) in props.list" :key="props.listKey(item, index)" :class="[
                    { 'cmusic_playlist_li_notransform':(true != props.transformX) },
                    'cmusic_playList_li',
                    (props.enableEdit
                        ? 'cmusic_edit_order'
                        : (props.selected(item, index))
                            ? 'cmusic_playList_item_selected'
                            : 'cmusic_playList_li_hover'),
                ]">
                <slot name="item" :item="item" :index="index">
                </slot>
            </li>
        </transition-group>
    </div>
</template>
