<script setup lang="ts">
import { storeToRefs }  from 'pinia';
import { User_store,UserData_c } from '../../stores/user/User';
import { UserList_store } from '../../stores/user/Users';
import { SrcIcon } from '../../stores/Src';
import MyBtn from '../global/MyBtn.vue';
import MyImage from '../global/MyImage.vue';

const props = defineProps({
    users: {    //歌单列表
        type: Array<UserData_c>,
        required: true
    },
})
const user_s = User_store();
const users_s = UserList_store();

const {
    isShow,
} = storeToRefs(users_s);

</script>

<template>
    <!-- 播放列表内容 -->
    <div class="cmusic_displayFlex_class" v-show="isShow.detail" style="width:100%; overflow: hidden; height: auto;">
        <!-- 列表左边的按钮栏 -->
        <div class="cmusic_displayFlexColumn_class cwin_center" style="width:40px">
        </div>
        <!-- 搜索用户结果 -->
        <transition-group v-if="isShow.detail" name="playlist_drag" class="cmusic_playList_ul cmusic_shadow" tag="ul" style="width: 100%;">
            <!-- 如果是当前显示的播放列表类型并且是已经选中的底标,则高亮显示 -->
            <li v-for="(item, index) in props.users" :key="index"
                class="cmusic_playList_li cmusic_playList_li_hover">
                <div style="width: 100%; display:flex; justify-content:space-between;">
                    <div style="display:flex;margin-right: 10px;width: 80%;">
                        <div class="cmusic_playList_thumb" style="margin-right: 10px;">
                            <my-image :src="item.icon" :err-src="user_s.default_src.img" />
                        </div>
                        <div style="width: 80%; display:flex; justify-content:start;">
                            <div class="cmusic_playList_title" style="margin-right: 20px;">
                                <span class="cmusic_li_name"  style="font-weight: bold">{{ item.name }}</span>
                                <span class="cmusic_li_artist">{{ item.uid }}</span>
                            </div>
                            <div class="cmusic_lists_tag" style="display:flex; justify-content:start;">
                            </div>
                        </div>
                    </div>
                    <!-- 列表项按钮 -->
                    <div class="cmusic_displayFlex_class cmusic_between" 
                        style="width: auto;margin-left: 0px;margin-right: 0px;">
                        <my-btn :icon="SrcIcon.userFollow_d" :shadow="false" />
                    </div>
                </div>
            </li>
        </transition-group>
    </div>
</template>
