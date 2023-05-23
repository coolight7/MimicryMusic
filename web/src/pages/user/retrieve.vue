<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive, } from "vue";
import { useRouter } from 'vue-router';
import { SrcIcon } from '../../stores/Src';
import { User_store } from "../../stores/user/User"
import { Global_store } from "../../stores/Global";
import InputRegexVue from '../../components/global/InputRegex.vue';
import SelectLineVue from '../../components/global/SelectLine.vue';
import MyBtn from '../../components/global/MyBtn.vue';

const user_s = User_store();
const global_s = Global_store();
const router = useRouter();

enum MyShowType_e {
    tip,
    passwd,
    account,
}

let mValue = reactive({
    showType: MyShowType_e.passwd,
    passwdShow:"password",
    tipStr: "",
    getEmailcode: {
        btn_checked: true,
        btn_disable_time: 60,
        btn_disable_fun: 0,
    }
})

const {
    regex,
    userdata,
} = storeToRefs(user_s);

const tip = (tipStr: string, time: number = -1) => {
    global_s.tip(tipStr, time);
}

let sign = {
    passwd: "",
    email: userdata.value.email,
    emailcode: "",
}

async function retrieve_getEmailCode_click() {
    if(mValue.getEmailcode.btn_checked == true) {
        mValue.getEmailcode.btn_checked = false;
        const reTime = await user_s.load_retrieveEmailCode(sign.email);
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

const showType_click = (in_type: MyShowType_e) => {
    mValue.showType = in_type;
}

const shift_passwdShow = () => {
    if(mValue.passwdShow == "password") {
        mValue.passwdShow = "text";
    } else {
        mValue.passwdShow = "password";
    }
}

const setPasswd_click = async () => {
    if(false == regex.value.email.test(sign.email)) {
        tip("邮箱格式错误");
        return;
    } else if(false == regex.value.emailcode.test(sign.emailcode)) {
        tip("邮箱验证码格式错误");
        return;
    } else if(false == regex.value.passwd.test(sign.passwd)) {
        tip("密码格式错误");
        return;
    }
    const rebool = await user_s.post_retrieve_passwd_byEmail(sign.email, parseInt(sign.emailcode), sign.passwd);
    if(true == rebool) {
        mValue.tipStr = "修改密码成功！请重新登录";
        mValue.showType = MyShowType_e.tip;
        user_s.userdata.passwd = sign.passwd;
    }
}

const toLogin_click = () => {
    router.push({
        path:"/user"
    });
}

</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <div class="cmusic_sign_type_div">
            <select-line-vue 
                text="找回密码"
                :selected="MyShowType_e.passwd == mValue.showType"
                @click="showType_click(MyShowType_e.passwd)">
            </select-line-vue>
            <select-line-vue 
                text="找回账号"
                :selected="MyShowType_e.account == mValue.showType"
                @click="showType_click(MyShowType_e.account)">
            </select-line-vue>
        </div>
        <div v-if="MyShowType_e.tip == mValue.showType" class="cmusic_displayFlexColumn_class">
            <span class="cmusic_textMain_color" style="font-weight: bolder; font-size: larger;">{{ mValue.tipStr }}</span>
        </div>
        <div v-if="MyShowType_e.passwd == mValue.showType" class="cmusic_user_sign_div">
            <input-regex-vue v-model:str="sign.email" type="text" :regex="regex.email" placeholder="邮箱" />
            <div class="cmusic_displayFlex_class" style="justify-content:center;">
                <input-regex-vue v-model:str="sign.emailcode" type="test" :regex="regex.emailcode"
                    style="width: auto;margin-left: 0;margin-right: 20px;" placeholder="邮箱验证码" />
                <my-btn t-text="获取验证码" :f-text="mValue.getEmailcode.btn_disable_time + '秒'"
                    :checked="mValue.getEmailcode.btn_checked" :enable=mValue.getEmailcode.btn_checked
                    @click="retrieve_getEmailCode_click()" />
            </div>
            <div class="cmusic_displayFlex_class">
                <div style="width:40px"></div>
                <input-regex-vue 
                    v-model:str="sign.passwd" 
                    :type="mValue.passwdShow" 
                    :regex="regex.passwd" 
                    placeholder="新密码" />
                <my-btn :checked="(mValue.passwdShow == 'text')" 
                    :t-icon="SrcIcon.eye_l" 
                    :f-icon="SrcIcon.eye_d" 
                    @click="shift_passwdShow()" />
            </div>
            <button @click="setPasswd_click" class="cmusic_user_sign_button">确定</button>
        </div>
        <div v-if="MyShowType_e.account == mValue.showType" class="cmusic_user_sign_div">
            <span class="cmusic_textCross_color">如果您记得用户名/UID/邮箱，都可以登录</span>
        </div>
        <div class="cmusic_displayFlex_class" style="justify-content: center;margin-top: 30px;margin-bottom: 30px;">
            <my-btn text="返回登录" @click="toLogin_click()" />
        </div>
    </div>
</template>