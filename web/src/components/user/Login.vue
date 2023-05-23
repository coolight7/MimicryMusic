<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive } from "vue";
import { useRouter } from 'vue-router';
import { User_store } from "../../stores/user/User"
import { Global_store } from "../../stores/Global";
import { SrcIcon } from '../../stores/Src';
import InputRegexVue from '../global/InputRegex.vue';
import CheckboxVue from '../global/Checkbox.vue';
import SelectLineVue from '../global/SelectLine.vue';
import MyBtn from '../global/MyBtn.vue';

const user_s = User_store();
const global_s = Global_store();
const router = useRouter();

let mValue = reactive({
    passwdShow:"password",
    getEmailcode: {
        btn_checked: true,
        btn_disable_time: 60,
        btn_disable_fun: 0,
    }
})

const {
    isShow,
    regex
} = storeToRefs(user_s);

const tip = (tipStr:string, time:number = -1) => {
    global_s.tip(tipStr, time);
}

//转换显示登录/注册
const loginType_click = (in_type:boolean) => {
    user_s.loginType_click(in_type);
}

let sign = {
    userName: user_s.userdata.name,
    isAutoLogin:true,
    signIn_passwd: user_s.userdata.passwd,
    signUp_passwd1:"",
    signUp_passwd2:"",
    signUp_email: "",
    signUp_emailcode: "",
}

if(sign.userName.length == 0) {
    const storage = window.localStorage;
    const reName = storage[user_s.localStorageNames.userName];
    if(null != reName && reName.length > 0) {
        sign.userName = reName;
    }
}

async function signUp_getEmailCode_click() {
    if(mValue.getEmailcode.btn_checked == true) {
        mValue.getEmailcode.btn_checked = false;
        const reTime = await user_s.load_bindEmailCode(sign.signUp_email);
        if(null == reTime) {
            mValue.getEmailcode.btn_checked = true;
            return;
        }
        mValue.getEmailcode.btn_disable_time = reTime;
        if(mValue.getEmailcode.btn_disable_fun != 0) {
            // 清除
            clearInterval(mValue.getEmailcode.btn_disable_fun);
            mValue.getEmailcode.btn_disable_fun = 0;
        }
        mValue.getEmailcode.btn_disable_fun = setInterval(() => {
            if(false == mValue.getEmailcode.btn_checked) {
                --mValue.getEmailcode.btn_disable_time;
                if(mValue.getEmailcode.btn_disable_time <= 0) {
                    mValue.getEmailcode.btn_checked = true;
                    // 清除
                    clearInterval(mValue.getEmailcode.btn_disable_fun);
                    mValue.getEmailcode.btn_disable_fun = 0;
                }
            }
        }, 1000);
    }
}

//登录按钮点击
async function signIn_click() {
    if (user_s.regex.loginName.test(sign.userName) == false) {
        tip("输入的账号格式错误！");
        return;
    }else if(user_s.isFormat_passwd(sign.signIn_passwd) == false){
        tip("密码格式错误！");
        return;
    }
    let rebool:boolean | null;
    if(user_s.regex.uid.test(sign.userName)) {
        rebool = await user_s.signIn(parseInt(sign.userName), undefined, undefined, sign.signIn_passwd, true);
    } else if(user_s.regex.name.test(sign.userName)) {
        rebool = await user_s.signIn(undefined, sign.userName, undefined, sign.signIn_passwd, true);
    } else if(user_s.regex.email.test(sign.userName)) {
        rebool = await user_s.signIn(undefined, undefined, sign.userName, sign.signIn_passwd, true);
    } else {
        tip("输入的账号格式错误");
        return;
    }
    if(true == rebool) {
        if(sign.isAutoLogin) {
            user_s.set_autoSignIn(true, undefined, user_s.userdata.name, user_s.user_passwd_last);
        }
    }
}
//注册按钮点击
async function signUp_click() {
    if (user_s.isFormat_name(sign.userName) != true) {
        tip("用户名格式错误！");
        return;
    } else if(user_s.isFormat_passwd(sign.signUp_passwd1) != true) {
        tip("密码格式错误！");
        return;
    } else if (sign.signUp_passwd1 != sign.signUp_passwd2) {
        tip("两次输入的密码不同");
        return;
    } else if (false == user_s.regex.email.test(sign.signUp_email)) {
        tip("邮箱格式不正确");
        return;
    } else if (false == user_s.regex.emailcode.test(sign.signUp_emailcode)) {
        tip("邮箱验证码格式不正确");
        return;
    }
    //注册用户
    const rebool = await user_s.signUp(sign.userName, sign.signUp_passwd1, sign.signUp_email, parseInt(sign.signUp_emailcode), true);
    if(rebool) {
        if(sign.isAutoLogin) {
            user_s.set_autoSignIn(true, undefined, user_s.userdata.name, user_s.user_passwd_last);
        }
    }
}

const shift_passwdShow = () => {
    if(mValue.passwdShow == "password") {
        mValue.passwdShow = "text";
    } else {
        mValue.passwdShow = "password";
    }
}

function toretrieve_click() {
    router.push({
        path:"/user/retrieve"
    });
}

</script>


<template>
    <!-- 未登录 -->
    <div v-if="!isShow.detailType" class="cmusic_displayFlexColumn_class">
        <div class="cmusic_sign_type_div">
            <select-line-vue 
                text="登录"
                :selected="isShow.loginType"
                :icon="SrcIcon.userSignIn"
                @click="loginType_click(true)">
            </select-line-vue>
            <select-line-vue 
                text="注册"
                :selected="!isShow.loginType"
                :icon="SrcIcon.userSignUp"
                @click="loginType_click(false)">
            </select-line-vue>
        </div>
        <div v-if="isShow.loginType" class="cmusic_user_sign_div">
            <div class="cmusic_displayFlex_class">
                <div style="width:40px"></div>
                <input-regex-vue 
                    v-model:str="sign.userName" 
                    :regex="regex.loginName" 
                    placeholder="用户名/UID/邮箱" 
                    @enter="signIn_click()" />
                <my-btn :checked="false" :t-icon="SrcIcon.userHistory_l" :f-icon="SrcIcon.userHistory_d" />
            </div>
            <div class="cmusic_displayFlex_class">
                <div style="width:40px"></div>
                <input-regex-vue 
                    v-model:str="sign.signIn_passwd" 
                    :type="mValue.passwdShow" 
                    :regex="regex.passwd" 
                    placeholder="密码" 
                    @enter="signIn_click()" />
                <my-btn :checked="(mValue.passwdShow == 'text')" :t-icon="SrcIcon.eye_l" :f-icon="SrcIcon.eye_d" @click="shift_passwdShow()" />
            </div>
            <div class="cmusic_checkbox_setbg" style="width:40%">
                <span class="cmusic_checkbox_span">记住密码</span>
                <checkbox-vue v-model:checked="sign.isAutoLogin"/>
            </div>
            <button @click="signIn_click()" class="cmusic_user_sign_button">登录</button>
        </div>
        <div v-else class="cmusic_user_sign_div">
            <input-regex-vue 
                v-model:str="sign.userName" 
                :regex="regex.name" 
                placeholder="用户名" 
                @enter="signUp_click()" />
            <input-regex-vue 
                v-model:str="sign.signUp_passwd1" 
                type="password" 
                :regex="regex.passwd" 
                placeholder="密码" 
                @enter="signUp_click()" />
            <input-regex-vue 
                v-model:str="sign.signUp_passwd2" 
                type="password" 
                :regex="regex.passwd" 
                placeholder="重复一次密码" 
                @enter="signUp_click()" />
            <input-regex-vue
                v-model:str="sign.signUp_email"
                type="text"
                :regex="regex.email"
                placeholder="邮箱"/>
            <div class="cmusic_displayFlex_class" style="justify-content:center;">
                <input-regex-vue 
                    v-model:str="sign.signUp_emailcode"
                    type="test"
                    :regex="regex.emailcode"
                    style="width: auto;margin: 0;margin-right: 20px;"
                    placeholder="邮箱验证码"/>
                <my-btn t-text="获取验证码" 
                    :f-text="mValue.getEmailcode.btn_disable_time + '秒'" 
                    :checked="mValue.getEmailcode.btn_checked" 
                    :enable=mValue.getEmailcode.btn_checked
                    @click="signUp_getEmailCode_click"/>
            </div>
            <div class="cmusic_checkbox_setbg" style="width:40%">
                <span class="cmusic_checkbox_span">记住密码</span>
                <checkbox-vue v-model:checked="sign.isAutoLogin"/>
            </div>
            <button @click="signUp_click()" class="cmusic_user_sign_button">注册</button>
        </div>
        <div class="cmusic_displayFlex_class" style="justify-content: center;margin-top: 30px;margin-bottom: 30px;">
            <my-btn text="忘记账号" @click="toretrieve_click" />
            <my-btn text="忘记密码" @click="toretrieve_click" />
        </div>
    </div>
</template>
