<script setup lang="ts">
import { reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { SrcIcon } from '../../stores/Src';
import { Url_store } from '../../stores/Url';
import { Src_store } from '../../stores/Src';
import { User_store, User_sex_e } from "../../stores/user/User";
import SelectFileImageVue from '../global/SelectFileImage.vue';
import InputRegexVue from '../global/InputRegex.vue';
import progressbar from '../global/Progress.vue';
import MyBtn from '../global/MyBtn.vue';
import { MySrcInfo_c, MySrcType_e, MySrc_c } from '../../util/MySrc';

const user_s    = User_store();
const url_s     = Url_store();
const router    = useRouter();
const src_s     = Src_store();

const {
    isShow,
    userdata,
} = storeToRefs(user_s);

//退出登录按钮
const user_signOut_click = () => {
    if(confirm("是否退出账号？") == true) {
        user_s.signOut();
    }
}

let mValue = reactive({
    isEdit:false,
    isEdit_change:false,
    ipArea:undefined,
    LevelExp:[0, 77,777,1777,7777,17777,77777],
    mystyle: {
        level:{
            color:"#75738f"
        },
        experience:{
            color:"#75738f",
        },
        sex:{
            boy:{
                color:"#66ccff",
            },
            girl:{
                color:"#eabad1"
            }
        }
    }
});
//编辑前的备份
let edit_cache = {
    icon:   new MySrc_c(new MySrcInfo_c()),
    motto:  "",
    sex:    0
}
//开始修改
const edit_click = () => {
    edit_cache.icon    = userdata.value.icon;       //备份数据
    edit_cache.motto   = userdata.value.motto;
    edit_cache.sex     = userdata.value.sex;
    mValue.isEdit = true;
}
//保存修改
const edit_save = async () => {
    if(mValue.isEdit_change) {
        const resrc = await src_s.tryDataURLUpload(userdata.value.icon.src);
        if(null != resrc) {
            userdata.value.icon = resrc;
            const rebool = await user_s.post_setInfo(userdata.value.icon, userdata.value.motto, userdata.value.sex, true);
            if(true == rebool) {
                mValue.isEdit = false;
                mValue.isEdit_change = false;
            }
        }
    } else {
        mValue.isEdit = false;
        mValue.isEdit_change = false;
    }
}
//取消修改
const edit_cancle = () => {
    if(mValue.isEdit_change) {      //恢复数据
        userdata.value.icon     = edit_cache.icon;
        userdata.value.motto    = edit_cache.motto;
        userdata.value.sex      = edit_cache.sex;
    }
    mValue.isEdit = false;
    mValue.isEdit_change = false;
}

function update_icon(data:string) {
    mValue.isEdit_change = true;
    userdata.value.icon = new MySrc_c(new MySrcInfo_c(MySrcType_e.LocalCache), data);
}

// 设置ip归属地
const set_ipArea = (ipInfo:any) => {
    if(ipInfo.nation == "中国") {
        if(ipInfo.province) {
            mValue.ipArea = ipInfo.province;
        } else {
            mValue.ipArea = ipInfo.nation;
        }
    } else {
        mValue.ipArea = ipInfo.nation;
    }
}
if(user_s.ipInfo) {
    set_ipArea(user_s.ipInfo);
} else {
    url_s.get_myIpInfo(true).then((ipInfo:any) => {
        user_s.ipInfo = ipInfo;
        set_ipArea(ipInfo);
    })
}
const playlist_click = () => {
    router.push({
        path:"/playlist"
    });
}
//歌词管理
const lyric_click = () => {
    router.push({
        path:"/lyric"
    });
}
const toBindEmail_click = () => {
    router.push({
        path:"/user/bindEmail"
    });
}

const toResetPasswd_click = () => {
    router.push({
        path:"/user/resetPasswd"
    });
}

</script>

<template>
    <div v-if="isShow.detailType">
        <!-- 用户信息栏 -->
        <div style="display:flex; flex-direction:column; margin-bottom: 20px;">
            <div class="cmusic_displayFlex_class" style="width: auto;height: 80px;margin-bottom: 10px;">
                <!-- 头像 -->
                <div class="cmusic_user_icon cwin_center">
                    <SelectFileImageVue 
                        v-model:src="userdata.icon" 
                        :enable="mValue.isEdit" 
                        :err-src="user_s.default_src.img" 
                        font-size="small" 
                        @change="update_icon" />
                </div>
                <div style="display:flex; flex-direction:column; margin-left: 20px;">
                    <span class="cmusic_user_name" style="font-size:xx-large; font-weight: bold; margin-bottom: 5px;">{{userdata.name}}</span>
                    <span class="cmusic_user_cid">UID: {{ userdata.uid }}</span>
                </div>
                <div class="cmusic_displayFlex_class cmusic_lists_tag cwin_center">
                    <span v-show="userdata.uid == 1000000">站长</span>
                </div>
            </div>
            <!-- 标签 -->
            <div class="cmusic_displayFlex_class cmusic_lists_tag cwin_center" style="margin-bottom: 20px;">
                <span v-show="userdata.sex == User_sex_e.boy" :style="mValue.mystyle.sex.boy">男</span>
                <span v-show="userdata.sex == User_sex_e.girl" :style="mValue.mystyle.sex.girl">女</span>
                <span v-show="mValue.ipArea">IP {{mValue.ipArea}}</span>
            </div>
            <div class="cmusic_displayFlex_class cwin_center" style="margin-bottom: 20px;">
                <!-- 经验 -->
                <div class="cmusic_lists_tag">
                    <span :style="mValue.mystyle.level">LV {{userdata.level}}</span>
                </div>
                <progressbar style="width: 50%; margin-left:20px; margin-right: 20px;" :length="userdata.experience / mValue.LevelExp[userdata.level]"/>
                <span :style="mValue.mystyle.experience">{{userdata.experience}} / {{mValue.LevelExp[userdata.level]}}</span>
            </div>
            <div class="cmusic_displayFlexColumn_class" style="margin-bottom: 20px;">
                <!-- 签名 -->
                <InputRegexVue 
                    @change="mValue.isEdit_change = true"
                    placeStr="签名"
                    v-model:str="userdata.motto" 
                    :enable="mValue.isEdit"
                    t-color="#a5b5cf" 
                    style="font-size: large;font-weight: bold;text-align: center;" />
            </div>
            <div class="cmusic_displayFlex_class cwin_center" style="height:40px;">
                <span @click="playlist_click()" class="cmusic_control_btn_noShadow cmusic_user_info_span">
                    <MyBtn :icon="SrcIcon.playlist_l" :text="userdata.createPlayList_num.toString()" />
                </span>
                <span class="cmusic_control_btn_noShadow cmusic_user_info_span">
                    <MyBtn :icon="SrcIcon.music" :text="userdata.createSongNum.toString()" />
                </span>
                <span @click="lyric_click()" class="cmusic_control_btn_noShadow cmusic_user_info_span">
                    <MyBtn :icon="SrcIcon.lyric_d" :text="userdata.createLyricNum.toString()" />
                </span>
            </div>
        </div>
        <!-- 用户界面功能按钮 -->
        <div class="cmusic_displayFlexColumn_class cwin_center">
            <div class="cmusic_displayFlex_class cwin_center" style="margin-bottom: 20px;">
                <span class="cmusic_textCross_color" style="font-size: large;">邮箱: {{ (userdata.email)? userdata.email : "未绑定" }}</span>
                <MyBtn v-show="!userdata.email" :icon="SrcIcon.addEmail" text="绑定邮箱" style="margin-left: 20px;" @click="toBindEmail_click()" />
            </div>
            <div class="cmusic_displayFlex_class cwin_center" style="margin-bottom: 10px;">
                <MyBtn v-show="!mValue.isEdit" text="修改信息" :icon="SrcIcon.edit" @click="edit_click()" />
                <MyBtn v-show="mValue.isEdit" :checked="mValue.isEdit_change" text="保存" :icon="SrcIcon.right" @click="edit_save()"/>
                <MyBtn v-show="mValue.isEdit" :checked="mValue.isEdit_change" text="取消" :icon="SrcIcon.cancle" @click="edit_cancle()" />
            </div>
            <MyBtn text="修改密码" :icon="SrcIcon.key_d" style="margin-bottom: 10px;" @click="toResetPasswd_click()" />
            <MyBtn text="退出登录" :icon="SrcIcon.user_exit" @click="user_signOut_click()" />
        </div>
    </div>
</template>