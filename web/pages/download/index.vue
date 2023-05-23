<script setup lang="ts">
import MyImage from "../../components/global/MyImage.vue";
import { Src_store, SrcIcon } from "../../stores/Src";
import { ContainBar_store } from '../../stores/contain/ContainBar';
import { MySrcInfo_c, MySrcType_e, MySrc_c } from "../../util/MySrc";
import MyBtn from "../../components/global/MyBtn.vue";
import { onMounted, reactive } from "vue";

const containbar_s = ContainBar_store();
containbar_s.closeAll();

const src_s = Src_store();

const down_android = "https://mycos-res.mimicry.cool/client/android/MimicryMusic_0_4_0-02.apk";
const down_android_SPNOLIBMK = "https://mycos-res.mimicry.cool/client/android/MimicryMusic_0_4_0-02-SPNOLIBMK.apk";
const down_windows = "https://mycos-res.mimicry.cool/client/windows/MimicryMusic_0_4_0-01.exe"; 

const mymusic_img = new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), src_s.cos.mimicryMusic);
const android_img = new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), src_s.cos.system.android);
const win_img = new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), src_s.cos.system.windows);

class ViewInfo_c {
    img = new MySrc_c<MySrcInfo_c>(new MySrcInfo_c());
    title:string = "";
    content:string = "";

    constructor(
        img: MySrc_c<MySrcInfo_c>,
        title: string,
        content: string,
    ) {
        this.img = img;
        this.title = title;
        this.content = content;
    }
}

const imgs = [
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img1-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img2-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img3-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img4-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img5-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img6-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img7-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img8-2.png"),
    new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), "http://mycos1.mimicry.cool/resources/images/download_view/img9-2.png"),
];
const data = reactive({
    infolist: [
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "简约", "无广告 不推送"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "播放页", "丰富多彩的动画"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "歌曲列表", "支持多种音乐来源"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "多种主题", "扁平风"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "歌词弹幕", "新体验"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "横屏适配", "对设备来者不拒"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "自制歌词", "自己动手，丰衣足食"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "夜间模式", "护眼配色"),
        new ViewInfo_c(new MySrc_c(new MySrcInfo_c(MySrcType_e.MyCos), ""), "夜间模式 | 扁平主题", "极致黑夜"),
    ]
})

const todownload_click = () => {
    document.getElementById("cmusic_download_todown")?.scrollIntoView();
}
const toviewinfo_click = () => {
    document.getElementById("cmusic_download_toview")?.scrollIntoView();
}

onMounted(() => {
    for(let i = 0, len = data.infolist.length; i < len;++i) {
        data.infolist[i].img = imgs[i];
    }
});

</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <div class="cmusic_displayFlex_class" style="justify-content:center;align-items: center;">
            <MyImage :src="mymusic_img" class="cmusic_download_icon" />
            <strong class="cmusic_textCross_color" style="font-size: 30px;margin-top:50px;margin-bottom: 50px;">拟声</strong>
        </div>
        <div id="cmusic_download_toview"></div>
        <div class="cmusic_displayFlex_class cmusic_user_sign_button" 
            @click="todownload_click()" 
            style="align-self: flex-start;justify-self: center;height: 60px;width: auto;align-items: center;margin-top:50px;margin-bottom: 50px;">
            <MyBtn :icon="SrcIcon.mobile_d" :shadow="false" />
            <span class="cmusic_textMain_color" style="font-weight: bolder;">立刻下载</span>
            <MyBtn :icon="SrcIcon.desktop_d" :shadow="false" />
        </div>
        <div v-for="(item, index) in data.infolist" class="cmusic_displayFlexColumn_class cmusic_download_viewItem" >
            <span class="cmusic_textMain_color cmusic_download_viewTextMain">{{ item.title }}</span>
            <span class="cmusic_textCross_color cmusic_download_viewTextCross">{{ item.content }}</span>
            <MyImage :src="item.img" class="cmusic_download_viewImg" loading="lazy" />
        </div>
        <div class="cmusic_displayFlex_class cmusic_user_sign_button" 
            style="align-self: flex-start;justify-self: center;height: 60px;width: auto;align-items: center;margin-top:100px;padding-left: 20px;padding-right: 20px;">
            <a href="https://blog.mimicry.cool/" target="_blank" class="cmusic_textMain_color">更多信息</a>
        </div>
        <div id="cmusic_download_todown" style="margin-top: 100px;"></div>
        <div class="cmusic_displayFlex_class cmusic_download_item">
            <MyImage :src="android_img" class="cmusic_download_system_img" />
            <div class="cmusic_displayFlexColumn_class" style="flex: 1;">
                <span class="cmusic_textMain_color" style="font-weight: bolder;">安卓端</span>
                <span class="cmusic_textCross_color">版本：0.4.0</span>
                <span class="cmusic_textCross_color">系统要求：Android 4.1 及以上</span>
            </div>
            <a :href="down_android" class="cmusic_control_btn" style="width: 120px;"><span>下载</span></a>
        </div>
        <div class="cmusic_displayFlex_class cmusic_download_item">
            <MyImage :src="android_img" class="cmusic_download_system_img" />
            <div class="cmusic_displayFlexColumn_class" style="flex: 1;">
                <span class="cmusic_textMain_color" style="font-weight: bolder;">安卓-缩减版</span>
                <span class="cmusic_textCross_color">版本：0.4.0</span>
                <span class="cmusic_textCross_color">如果完整版闪退请尝试这个;缺失新播放组件Libmpv</span>
            </div>
            <a :href="down_android_SPNOLIBMK" class="cmusic_control_btn" style="width: 120px;"><span>下载</span></a>
        </div>
        <div class="cmusic_displayFlex_class cmusic_download_item">
            <MyImage :src="win_img" class="cmusic_download_system_img" />
            <div class="cmusic_displayFlexColumn_class" style="flex: 1;">
                <span class="cmusic_textMain_color" style="font-weight: bolder;">Windows端</span>
                <span class="cmusic_textCross_color">版本：0.4.0</span>
                <span class="cmusic_textCross_color">系统要求：win10 及以上</span>
            </div>
            <a :href="down_windows" class="cmusic_control_btn" style="width: 120px;"><span>下载</span></a>
        </div>
        <div class="cmusic_displayFlex_class cmusic_user_sign_button" 
            @click="toviewinfo_click()" 
            style="align-self: flex-start;justify-self: center;height: 60px;width: auto;align-items: center;margin-top:100px;">
            <MyBtn :icon="SrcIcon.pointDoubleLeft" :shadow="false" />
            <span class="cmusic_textMain_color" style="font-weight: bolder;">查看介绍</span>
            <MyBtn :icon="SrcIcon.pointDoubleRight" :shadow="false" />
        </div>
    </div>
</template>

<style>
.cmusic_download_icon {
    background: #e3eefa;
    border-radius: 10px;
    height: 50px;
    width: 50px;
    padding: 5px;
    margin: 0px;
    margin-right: 20px;
    box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.1),
        -5px -5px 10px rgba(255, 255, 255, 1);
    -webkit-box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.1),
        -5px -5px 10px rgba(255, 255, 255, 1);
}
.cmusic_download_viewItem {
    height: 800px;
    width: 100%;
    justify-content:space-around;
    align-items: center;
    border-radius: 50px;
    margin: 0px;
    margin-top: 20px;
    background: #e3eefa;
    box-shadow: 30px 30px 60px rgba(0, 0, 0, 0.1),
        -10px -10px 30px rgba(255, 255, 255, 1);
    -webkit-box-shadow: 30px 30px 60px rgba(0, 0, 0, 0.1),
        -10px -10px 30px rgba(255, 255, 255, 1);
}
.cmusic_download_viewTextMain {
    font-weight: bolder;
    font-size: xx-large;
}
.cmusic_download_viewTextCross {
    font-weight: bold;
    font-size: large;
}
.cmusic_download_viewImg {
    height: 600px;
    width: 90%;
    border-radius: 50px;
    margin: 0px;
}
.cmusic_download_item {
    height: 120px;
    align-items: center;
    background: #e3eefa;
    border-radius: 20px;
    margin-top: 30px;
    box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.1),
        -5px -5px 10px rgba(255, 255, 255, 1);
    -webkit-box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.1),
        -5px -5px 10px rgba(255, 255, 255, 1);
}
.cmusic_download_system_img {
    height: 100px;
    width: 100px;
    padding: 10px;
    padding-left: 20px;
}
.ngint_body .cmusic_download_viewItem {
    background: #42444e;
    box-shadow: 30px 30px 60px #2f3236,
        -10px -10px 30px #545b73;
    -webkit-box-shadow: 30px 30px 60px #2f3236,
        -10px -10px 30px #545b73;
}
.ngint_body .cmusic_download_icon, .ngint_body .cmusic_download_item {
    background: #42444e;
    box-shadow: 10px 10px 20px #2f3236,
        -5px -5px 10px #545b73;
    -webkit-box-shadow:10px 10px 20px #2f3236,
        -5px -5px 10px #545b73;
}
</style>
