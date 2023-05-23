<script setup lang="ts">
import { reactive, onMounted, watch } from "vue";
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { User_store } from "../../stores/user/User";
import InputRegexVue from '../../components/global/InputRegex.vue'
import { Global_store } from "../../stores/Global";;
import MyBtn from '../../components/global/MyBtn.vue';
import { SrcIcon } from '../../stores/Src';

enum MyShowType_e {
    reset, 
    tip,
}

const router = useRouter();
const user_s    = User_store();
const global_s = Global_store();

const tip = (tipStr:string, time:number = -1) => {
    global_s.tip(tipStr, time);
}
const {
    userdata,
    regex,
} = storeToRefs(user_s);

let mValue = reactive({
    old_passwdShow: "password",
    new_passwdShow: "password",
    showType: MyShowType_e.reset,
    tipStr: "",
})

let sign = {
    old_passwd: "",
    new_passwd: "",
}

const shift_old_passwdShow = () => {
    if(mValue.old_passwdShow == "password") {
        mValue.old_passwdShow = "text";
    } else {
        mValue.old_passwdShow = "password";
    }
}
const shift_new_passwdShow = () => {
    if(mValue.new_passwdShow == "password") {
        mValue.new_passwdShow = "text";
    } else {
        mValue.new_passwdShow = "password";
    }
}

const resetPasswd_click = async () => {
    if(false == user_s.regex.passwd.test(sign.old_passwd)) {
        tip("输入的旧密码格式错误");
        return;
    } else if(false == user_s.regex.passwd.test(sign.new_passwd)) {
        tip("输入的新密码格式错误");
        return;
    }
    const rebool = await user_s.post_reset_passwd(sign.old_passwd, sign.new_passwd);
    if(true == rebool) {
        mValue.showType = MyShowType_e.tip;
        mValue.tipStr = "密码修改成功, 请重新登录";
        user_s.signOut().then(() => {
            user_s.userdata.passwd = sign.new_passwd;
        });
        return;
    }
}

const toUser_click = () => {
    router.push({
        path:"/user"
    });
}

const toRetrieve_click = () => {
    router.push({
        path:"/user/retrieve"
    });
}
const update_loginState = () => {
    if(!userdata.value.name) {
        mValue.showType = MyShowType_e.tip;
        mValue.tipStr = "请登录账号";
    } else {
        mValue.showType = MyShowType_e.reset;
    }
}

update_loginState();

onMounted(() => {
    watch(
        () => userdata.value.name,
        update_loginState
    )
});

</script>

<template>
<div class="cmusic_displayFlexColumn_class">
        <div class="cmusic_displayFlexColumn_class" style="margin-bottom: 30px;">
            <span class="cmusic_textMain" >修改密码</span>
            <span class="cmusic_textCross">您正在为账号 {{ userdata.name }} 修改密码</span>
        </div>
        <div v-if="MyShowType_e.tip == mValue.showType" class="cmusic_displayFlexColumn_class">
            <span class="cmusic_textMain_color" style="font-weight: bolder; font-size: larger;">{{ mValue.tipStr }}</span>
        </div>
        <div v-if="MyShowType_e.reset == mValue.showType">
            <div class="cmusic_displayFlex_class">
                <div style="width:40px"></div>
                <input-regex-vue 
                    v-model:str="sign.old_passwd" 
                    :type="mValue.old_passwdShow" 
                    :regex="regex.passwd" 
                    placeholder="旧密码" />
                <my-btn :checked="(mValue.old_passwdShow == 'text')" :t-icon="SrcIcon.eye_l" :f-icon="SrcIcon.eye_d" @click="shift_old_passwdShow()" />
            </div>
            <div class="cmusic_displayFlex_class">
                <div style="width:40px"></div>
                <input-regex-vue 
                    v-model:str="sign.new_passwd" 
                    :type="mValue.new_passwdShow" 
                    :regex="regex.passwd" 
                    placeholder="新密码" />
                <my-btn :checked="(mValue.new_passwdShow == 'text')" :t-icon="SrcIcon.eye_l" :f-icon="SrcIcon.eye_d" @click="shift_new_passwdShow()" />
            </div>
            <button @click="resetPasswd_click" class="cmusic_user_sign_button">确定</button>
        </div>
        <div class="cmusic_displayFlex_class" style="justify-content: center;margin-top: 30px;margin-bottom: 30px;">
            <my-btn text="返回" @click="toUser_click()" />
            <my-btn text="验证邮箱修改密码" @click="toRetrieve_click()" />
        </div>
    </div>
</template>
