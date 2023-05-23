<script setup lang="ts">
import { reactive, onMounted, watch } from "vue";
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { User_store } from "../../stores/user/User";
import InputRegexVue from '../../components/global/InputRegex.vue'
import { Global_store } from "../../stores/Global";;
import MyBtn from '../../components/global/MyBtn.vue';

enum MyShowType_e {
    bind, 
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
    showType: MyShowType_e.bind,
    tipStr: "",
    getEmailcode: {
        btn_checked: true,
        btn_disable_time: 60,
        btn_disable_fun: 0,
    }
})

let sign = {
    email: "",
    emailcode: "",
}

const getBindEmailCode_click = async () => {
    if(!userdata.value.name) {
        tip("请登录账号");
        return;
    }
    if(mValue.getEmailcode.btn_checked == true) {
        mValue.getEmailcode.btn_checked = false;
        const reTime = await user_s.load_bindEmailCode(sign.email);
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

const bind_click = async () => {
    if(false == user_s.regex.email.test(sign.email)) {
        tip("邮箱格式错误");
        return;
    } else if(false == user_s.regex.emailcode.test(sign.emailcode)) {
        tip("验证码格式错误");
        return;
    }
    const rebool = await user_s.post_bindEmail(sign.email, parseInt(sign.emailcode));
    if(true == rebool) {
        mValue.showType = MyShowType_e.tip;
        mValue.tipStr = "绑定邮箱成功";
        user_s.getUserInfo();
    }
}

const toUser_click = () => {
    router.push({
        path:"/user"
    });
}

const update_loginState = () => {
    if(!userdata.value.name) {
        mValue.showType = MyShowType_e.tip;
        mValue.tipStr = "请登录账号";
    } else {
        mValue.showType = MyShowType_e.bind;
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
            <span class="cmusic_textMain" >绑定邮箱</span>
            <span class="cmusic_textCross">您正在为账号 {{ userdata.name }} 绑定邮箱</span>
        </div>
        <div v-if="MyShowType_e.tip == mValue.showType" class="cmusic_displayFlexColumn_class">
            <span class="cmusic_textMain_color" style="font-weight: bolder; font-size: larger;">{{ mValue.tipStr }}</span>
        </div>
        <div v-if="MyShowType_e.bind == mValue.showType">
            <input-regex-vue
                v-model:str="sign.email"
                type="text"
                :regex="regex.email"
                placeholder="邮箱"/>
            <div class="cmusic_displayFlex_class" style="justify-content:center;">
                <input-regex-vue 
                    v-model:str="sign.emailcode"
                    type="test"
                    :regex="regex.emailcode"
                    style="width: auto;margin: 0;margin-right: 20px;"
                    placeholder="邮箱验证码"/>
                <my-btn t-text="获取验证码" 
                    :f-text="mValue.getEmailcode.btn_disable_time + '秒'" 
                    :checked="mValue.getEmailcode.btn_checked" 
                    :enable=mValue.getEmailcode.btn_checked
                    @click="getBindEmailCode_click()"/>
            </div>
            <div style="height: 30px;"></div>
            <button @click="bind_click" class="cmusic_user_sign_button">绑定</button>
        </div>
        <div class="cmusic_displayFlex_class" style="justify-content: center;margin-top: 30px;margin-bottom: 30px;">
            <my-btn text="返回" @click="toUser_click()" />
        </div>
    </div>
</template>
