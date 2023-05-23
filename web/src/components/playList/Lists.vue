<script setup lang="ts">
import { ref, onBeforeUnmount, reactive } from "vue";
import { storeToRefs } from "pinia";
import { Global_store } from "../../stores/Global";
import { PopWin_store } from "../../stores/popWin/PopWin";
import { PlayList_Lists_store, Playlist_c, Playlist_access_e, Playlist_state_e } from "../../stores/playList/Lists";
import { PlayList_store } from "../../stores/playList/PlayList";
import { SrcIcon } from "../../stores/Src";
import ListDetailsVue from "../global/ListDetails.vue";
import MySvg from "../global/MySvg.vue";
import MyBtn from "../global/MyBtn.vue";
import MyImage from "../global/MyImage.vue";
import { User_store } from "../../stores/user/User";
import { Src_store } from "../../stores/Src";

const src_s = Src_store();
const user_s = User_store();
const global_s = Global_store();
const popWin_s = PopWin_store();
const lists_s = PlayList_Lists_store();
const playlist_s = PlayList_store();

const cmusic_list = <any>ref(null);

const props = defineProps({
  lists: {
    //歌单列表
    type: Array<Playlist_c>,
    required: true,
  },
  enable: {
    //启用功能
    type: Object,
    required: true,
  },
});
//事件信号
const emits = defineEmits({
  "update:lists": null, //v-model:lists传参
  "list-reload": null, //重新网络加载lists信号
  "list-save": null, //保存修改信号
  "list-beforeAdd": (event) => {
    //添加歌单前信号
    if (event) {
      return true;
    } else {
      console.warn("Lists.vue: 事件'list-beforeAdd'所绑定的函数未接收关键参数");
      return true;
    }
  },
  "item-click": (item) => {
    //歌单项点击信号
    if (item) {
      return true;
    } else {
      console.warn("Lists.vue: 事件'item-click'所绑定的函数未接收关键参数");
      return true;
    }
  },
  "items-remove": (selectlists) => {
    //移除若干个歌单项信号
    if (selectlists) {
      return true;
    } else {
      console.warn("事件'items-remove'所绑定的函数未接收关键参数");
      return true;
    }
  },
});

/*
//启用功能
enable:{
    array:{
        all:true,

        add:true,           //创建
        order:true,         //排序
        delete:true,        //移除
    },
    item:{
        all:true,

        edit:true,          //编辑
        interact:true,      //互动
    },
},
*/

let mValue = reactive({
    list_cache: new Array<Playlist_c>() //暂存修改前的备份
})


//修改歌单信息
function editListInfo_click(in_list: Playlist_c) {
  popWin_s.open_editlist(function (to_list: Playlist_c) {
    lists_s.post_editlist(to_list, true).then((res: boolean) => {
      if(true == res) {
        for (let key in to_list) {
          in_list[key] = to_list[key];
        }
        popWin_s.closeDetail();
      }
    });
  }, in_list);
}

//添加歌单按钮
function addList_click() {
  let event = global_s.getTemp_event();
  emits("list-beforeAdd", event);
  if (!event.isTodo()) {
    return;
  }
  popWin_s.open_addlist(function (in_list: Playlist_c) {
    playlist_s.post_createlist(in_list, true)
      .then(
        (res) => {
          if(res) {
            popWin_s.closeDetail();
            setTimeout(function () {
              cmusic_list.value.focus_item(props.lists.length - 1);
            }, 300);
          }
        }
      );
  });
}

const lists_item_click = (item: Playlist_c) => {
  emits("item-click", item);
};

const removeList_click = (in_checkedList: Array<number>) => {
  let check_len = in_checkedList.length;
  if (check_len == 0) {
    global_s.tip("请先选择要删除的歌单");
    return;
  }
  let nameList = "",
    selectlists = [];
  let playlist = props.lists;
  for (let i = check_len; i-- > 0;) {
    nameList += playlist[in_checkedList[i]].name + "\n";
    selectlists.push(playlist[in_checkedList[i]]);
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
      playlist.splice(in_checkedList[i], 1);
    }
    emits("items-remove", selectlists);
    in_checkedList.length = 0;
  }
};
const edit_save_click = () => {
    emits("list-save");
};

const list_like_click = (item: Playlist_c) => {
  lists_s.list_like_click(item);
};
const list_star_click = (item: Playlist_c) => {
  lists_s.list_star_click(item);
};
//请求更新列表
const update_lists = (in_list:Array<Playlist_c>) => {
  emits('update:lists', in_list);
}
const update_listCache = (in_list:Array<Playlist_c>) => {
  mValue.list_cache = new Array<Playlist_c>();
  in_list.forEach((value, index, array) => {
    mValue.list_cache.push(value.copyWith());
  });
}

const list_key = (in_item:Playlist_c) => {
  return in_item.pid;
}
const selected = (in_item:Playlist_c) => {
  return (getSelectList.value.pid == in_item.pid);
}

const { getUserCid } = storeToRefs(user_s);
const { getSelectList } = storeToRefs(playlist_s);
const { isShow } = storeToRefs(lists_s);

</script>

<template>
  <ListDetailsVue 
    ref="cmusic_list"
    v-show="isShow.detail" 
    :list="props.lists" 
    @update:list="update_lists"
    :list-cache="mValue.list_cache" 
    @update:list-cache="update_listCache"
    :enable="props.enable"
    :check-box="true" 
    :transform-x="false"
    :list-key="list_key" 
    :selected="selected" 
    @item-click="lists_item_click"
    @add-item="addList_click()"
    @remove-item="removeList_click"
    @list-save="edit_save_click">
    <template #img="{ item }">
      <div class="cmusic_playList_thumb" style="margin-right: 10px;">
        <MyImage :src="((<Playlist_c>item).state == Playlist_state_e.Normal) ? (<Playlist_c>item).icon : src_s.icon.music_disable" :err-src="lists_s.default_src.img" draggable="false" alt="歌单封面" />
      </div>
    </template>
    <template #info="{ item }">
      <span class="cmusic_li_name" style="font-weight: bold">{{ ((<Playlist_c>item).state == Playlist_state_e.Normal) ? (<Playlist_c>item).name : "[歌单失踪了~]" }}</span>
      <span class="cmusic_li_artist">{{ (<Playlist_c>item).pid }}</span>
    </template>
    <template #tags="{ item }">
      <span class="cmusic_displayFlex_class">
        <my-svg :name="SrcIcon.music" />
        <span class="cmusic_lists_tag_text">{{ (<Playlist_c>item).song_num }}</span>
      </span>
      <span v-if="(<Playlist_c>item).access == Playlist_access_e.Private">私密</span>
      <span v-else-if="(<Playlist_c>item).access == Playlist_access_e.Protected">保护</span>
      <span v-else-if="(<Playlist_c>item).access == Playlist_access_e.Public">公开</span>
    </template>
    <template #interactButton="{item}">
      <!-- 管理按钮 -->
      <div v-if="(<Playlist_c>item).uid == getUserCid">
        <my-btn @click="editListInfo_click((<Playlist_c>item))" :icon="SrcIcon.edit" :shadow="false" />
      </div>
      <!-- 互动按钮 -->
      <div v-if="props.enable.item.interact && (<Playlist_c>item).uid != getUserCid" class="cmusic_displayFlex_class"
        style="width: auto">
        <button @click="list_like_click((<Playlist_c>item))" class="cmusic_control_btn_noShadow cmusic_btn_span">
          <my-svg v-if="(<Playlist_c>item).islove" :name="SrcIcon.like_l" />
          <my-svg v-else :name="SrcIcon.like_d" />
          <span>{{ (<Playlist_c>item).love }}</span>
        </button>
        <button @click="list_star_click((<Playlist_c>item))" class="cmusic_control_btn_noShadow cmusic_btn_span">
          <my-svg v-if="(<Playlist_c>item).isstar" :name="SrcIcon.star_l" />
          <my-svg v-else :name="SrcIcon.star_d" />
          <span>{{ (<Playlist_c>item).star }}</span>
        </button>
      </div>
    </template>
  </ListDetailsVue>
</template>