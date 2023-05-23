<script setup lang="ts">
import { SongAudioSrcInfo_c } from '../../stores/playList/Song';
import { MySrc_c, MySrcTypeStr_e, MySrcType_e } from '../../util/MySrc';
import { ref, defineComponent, reactive, onMounted, watch } from 'vue';
import ListDetails from '../global/ListDetails.vue';
import PopWinBase from './PopWinBase.vue';
import { Global_store } from '../../stores/Global';

const global_s = Global_store();

const props = defineProps({
    list: {
        type: Array<MySrc_c<SongAudioSrcInfo_c>>,
        required:true,
    },
    index: {
        type: Number,
        default: 0,
    }
});

let mValue = reactive({
    list: props.list,
    list_cache: new Array<MySrc_c<SongAudioSrcInfo_c>>(),
    index: props.index,
}) 

const emits = defineEmits({
    "update:list":(list:Array<MySrc_c<SongAudioSrcInfo_c>>) => {
        if(list) {} else {
            console.log("SongAudioSrcSelect.vue: 事件 'update:list' 所绑定的函数未接收关键参数");
        }
        return true;
    },
    "change": (index:number) => {
        if(index) {
            return true;
        } else {
            console.log("SongAudioSrcSelect.vue: 事件 'change' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    "cancle": null,
})

const add_click = () => {
    props.list.push(
        new MySrc_c(new SongAudioSrcInfo_c(MySrcType_e.Bili))
    );
}

const remove_click = (in_checkedList: Array<number>) => {
  let check_len = in_checkedList.length;
  if (check_len == 0) {
    global_s.tip("请先选择要删除的歌单");
    return;
  }
  let nameList = "";
  let playlist = props.list;
  for (let i = check_len; i-- > 0;) {
    nameList += playlist[in_checkedList[i]].src + "\n";
  }
  if (confirm("是否确认把以下歌单删除？\n\n" + nameList)) {
    //确认删除
    //先将checkList存的下标排序(从小到大)
    in_checkedList.sort(function (x, y) {
      if (x < y) return -1;
      else if (x > y) return 1;
      else return 0;
    });
    //从大到小移除列表
    for (let i = check_len; i--;) {
        props.list.splice(in_checkedList[i], 1);
    }
    
    in_checkedList.length = 0;
  }
};

const item_click = (item:MySrc_c<SongAudioSrcInfo_c>, index:number) => {
    emits('change', index);
}

const cancle_click = () => {
    emits('cancle');
}

const btnlist = [
    {
        isShow:true,
        str:"关闭",
        fun:cancle_click
    }
]

const update_index = function(index:number) {
    mValue.index = index;
}

const update_list = function(list:Array<MySrc_c<SongAudioSrcInfo_c>>) {
    emits('update:list', list);
}

const update_listCache = function(list:Array<MySrc_c<SongAudioSrcInfo_c>>) {
    mValue.list_cache = new Array<MySrc_c<SongAudioSrcInfo_c>>();
    list.forEach((value, index, array) => {
        mValue.list_cache.push(value.copyWith());
    });
}

onMounted(() => {
    watch(
        () => props.index,
        update_index
    )
});

</script>  

<template>
    <PopWinBase title="音乐资源管理" :f-btns="btnlist">
        <div style="height: 500px;">
            <ListDetails 
                :list="props.list"
                :list-cache="mValue.list_cache"
                :list-key="(item:MySrc_c<SongAudioSrcInfo_c>, index:number) => item.toString()"
                :check-box="true"
                :transform-x="false"
                :selected="(item:any, index: number) => (mValue.index == index)"
                @update:list="update_list"
                @update:list-cache="update_listCache"
                @add-item="add_click"
                @remove-item="remove_click"
                @item-click="item_click">
                <template #info="{ item }">
                    <span class="cmusic_li_name">{{ (<MySrc_c<SongAudioSrcInfo_c>>item).src || "[空]" }}</span>
                </template>
                <template #tags="{ item }">
                    <span>{{ MySrcTypeStr_e.toTag((<MySrc_c<SongAudioSrcInfo_c>>item).info.type) }}</span>
                </template>
            </ListDetails>
        </div>
    </PopWinBase>
</template>