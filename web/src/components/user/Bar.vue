<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { User_store } from "../../stores/user/User"
import { useRouter } from 'vue-router';
import MyImage from '../global/MyImage.vue';

const user_s = User_store();
const router = useRouter();

const {
    userdata: user,
    isShow,
    isLogin,
} = storeToRefs(user_s);

const user_click = () => { 
    router.push({
        path:'/user'
    })
}

</script>
<template>
    <!-- 用户栏 -->
    <div v-if="isShow.bar" @click="user_click()" class="cwin_user_div" style="cursor: pointer;">
        <span v-show="false == isLogin" class="cmusic_textCross_color" style="width: 80px;font-weight: bold;text-align: center;align-self: center;">点击登录</span>
        <div class="cmusic_user_icon cwin_center" style="width: 40px;height: 40px;">
            <MyImage :src="user.icon" :err-src="user_s.default_src.img" />
        </div>
    </div>
</template>

