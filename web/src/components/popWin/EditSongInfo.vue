<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia';
import { Url_store, ErrValue_c } from "../../stores/Url"
import { Global_store } from "../../stores/Global"
import { SongAudioSrcInfo_c, Song_c, Song_store } from '../../stores/playList/Song';
import { SrcIcon } from '../../stores/Src';
import { Src_store } from '../../stores/Src';
import SelectFileImageVue from '../global/SelectFileImage.vue';
import InputRegexVue from '../global/InputRegex.vue';
import SelectLineVue from '../global/SelectLine.vue';
import PopWinBase from "./PopWinBase.vue";
import MyBtn from '../global/MyBtn.vue';
import { MySrcInfo_c, MySrcType_e, MySrc_c, MySrcTypeStr_e } from '../../util/MySrc';
import SongAudioSrcSelect from "./SongAudioSrcSelect.vue";

const url_s = Url_store();
const global_s = Global_store();
const song_s = Song_store();
const src_s = Src_store();

const  {
    regex
} = storeToRefs(song_s);

const props = defineProps({
    song:{
        type:Song_c,
        required:true,
    }
})

const emits = defineEmits({
    'save':(song:Song_c) => {
        if(song) {
            return true;
        } else {
            console.log("EditSongInfo.vue: 事件 'add' 所绑定的函数未接收关键参数");
            return true;
        }
    },
    "cancle":null
})

let mValue = reactive({
    song:props.song.copyWith(),
    audioIndex: 0,
    isShowSelectSrc:false,
})

function update_icon(data:string) {
    mValue.song.icon = new MySrc_c(new MySrcInfo_c(MySrcType_e.LocalCache), data);
}

const save_click = async () => {
    if (!regex.value.name.test(mValue.song.name)) {
        global_s.tip("歌曲名 格式错误");
        return;
    }
    if (!regex.value.artist.test(mValue.song.artist)) {
        global_s.tip("艺术家 格式错误");
        return;
    }
    if(mValue.song.icon.src.length > 0) {
        const resrc = await src_s.tryDataURLUpload(mValue.song.icon.src);
        if(null != resrc) {
            mValue.song.icon = resrc;
            emits('save', mValue.song);
        }
    } else {
        emits('save', mValue.song);
    }
}

function tryNowAudioSrc() : MySrc_c<SongAudioSrcInfo_c> | null {
    return mValue.song.tryGetAudioSrc(mValue.audioIndex);
}

function getNowAudioSrc(): MySrc_c<SongAudioSrcInfo_c> {
    return mValue.song.getAudioSrc(mValue.audioIndex);
}

function updateNowAudioSrc(src:string) {
    mValue.song.getAudioSrc(mValue.audioIndex).setSrc(src);
}

const cancle_click = () => {
    emits('cancle');
}

const btnlist = [
    {
        isShow: true,
        str: "修改",
        fun: save_click
    },
    {
        isShow: true,
        str: "取消",
        fun: cancle_click
    }
]

const setSongSrcType = (in_type:MySrcType_e) => {
    tryNowAudioSrc()?.info.setType(in_type);
}
const getBiliInfo_click = () => {
    const audioSrc = tryNowAudioSrc();
    if(null != audioSrc && audioSrc.info.type == MySrcType_e.Bili) {
        let bvid:string | null = global_s.filterBvid(audioSrc.src);
        if(bvid) {
            // 非空
            audioSrc.setSrc(bvid);
            const succFun = (res:any) => {
                let data = res.data.data;
                mValue.song.name = data.title;
                mValue.song.artist = data.owner.name;
                mValue.song.icon = new MySrc_c(
                    new MySrcInfo_c(MySrcType_e.Bili),
                    data.pic,
                );
            }
            let url = url_s.proxy.bili.view;
            url_s.getServer(url, 
            {
                "bvid":audioSrc.src
            },
            false).then((res:any) => {
                succFun(res);
            }).catch((err:ErrValue_c) => {
                if(false == err.isErr) {
                    succFun(err.data);
                } else {
                    global_s.tip("获取视频信息失败");
                }
            })
        } else {
            global_s.tip("请输入正确的bv号");
        }
    }
}

</script>

<template>
    <PopWinBase title="修改歌曲信息" :f-btns="btnlist">
        <div class="cwin_displayFlex cwin_center" style="height:170px">
            <SelectFileImageVue :src="mValue.song.icon" @change="update_icon" class="cwin_content_img" :err-src=" song_s.default_src.img" />
            <div class="cwin_displayFlexColumn cwin_info_input">
                <InputRegexVue 
                    v-model:str="mValue.song.name" 
                    :regex="regex.name"
                    style="margin-bottom:20px"
                    placeholder="歌曲名" />
                <InputRegexVue 
                    v-model:str="mValue.song.artist" 
                    :regex="regex.artist"
                    placeholder="艺术家" />
            </div>
        </div>
        <div class="cwin_displayFlex" @click="mValue.isShowSelectSrc = !mValue.isShowSelectSrc" style="margin-top: 20px;padding-left: 10px;padding-right: 10px;width: 90%; height: 40px;border-radius: 30px;border: 1px solid #66ccff;align-items: center;justify-items: center; cursor: pointer;">
            <span class="cmusic_textCross_color">{{ mValue.audioIndex + 1 }} / {{ mValue.song.audio.length }}</span>
            <MyBtn :icon="SrcIcon.pointRight" :shadow=false />
            <div class="cmusic_lists_tag" style="display:flex; justify-content:start;">
                <span>{{ MySrcTypeStr_e.toTag(mValue.song.getAudioSrcType()) }}</span>
            </div>
            <span class="cmusic_textCross_color cmusic_text_ellipsis" style="flex: 1">{{ mValue.song.tryGetAudioSrc(mValue.audioIndex)?.src || "[空]" }}</span>
        </div>
        <div class="cwin_displayFlexColumn" style="height: 200px;">
            <div class="cmusic_displayFlex_class">
                <select-line-vue text="bili" :selected="mValue.song.tryGetAudioSrc(mValue.audioIndex)?.info.type == MySrcType_e.Bili" @click="setSongSrcType(MySrcType_e.Bili)" />
                <select-line-vue text="音乐链接" :selected="mValue.song.tryGetAudioSrc(mValue.audioIndex)?.info.type == MySrcType_e.UrlLink" @click="setSongSrcType(MySrcType_e.UrlLink)" />
                <select-line-vue text="本地文件" :selected="mValue.song.tryGetAudioSrc(mValue.audioIndex)?.info.type == MySrcType_e.Local" @click="setSongSrcType(MySrcType_e.Local)" />
            </div>
            <div v-show="mValue.song.tryGetAudioSrc(mValue.audioIndex)?.info.type == MySrcType_e.Bili" class="cwin_displayFlexColumn">
                <span class="cwin_tipSpan">将B站视频作为歌曲加入歌单</span>
                <div class="cwin_displayFlex cwin_center">
                    <InputRegexVue 
                        :str="getNowAudioSrc().src"
                        @update:str="updateNowAudioSrc"
                        :regex="regex.src"
                        placeholder="bv号"
                        style="margin-top: 10px;width:77%;" />
                    <my-btn :icon="SrcIcon.download2" @click="getBiliInfo_click()" />
                </div>
            </div>
            <div v-show="mValue.song.tryGetAudioSrc(mValue.audioIndex)?.info.type == MySrcType_e.UrlLink" class="cwin_displayFlexColumn">
                <span class="cwin_tipSpan">填入音乐文件的下载链接</span>
                <InputRegexVue 
                    :str="getNowAudioSrc().src"
                    @update:str="updateNowAudioSrc"
                    :regex="regex.src"
                    placeholder="音乐文件链接"
                    style="margin-top: 10px;" />
            </div>
            <div v-show="mValue.song.tryGetAudioSrc(mValue.audioIndex)?.info.type == MySrcType_e.Local" class="cwin_displayFlexColumn">
                <span class="cwin_tipSpan">填入本地音乐文件所在路径</span>
                <InputRegexVue 
                    :str="getNowAudioSrc().src"
                    @update:str="updateNowAudioSrc"
                    :regex="regex.src"
                    placeholder="本地文件路径"
                    style="margin-top: 10px;" />
            </div>
        </div>
        <SongAudioSrcSelect 
            v-if="mValue.isShowSelectSrc" 
            v-model:list="mValue.song.audio" 
            :index="mValue.audioIndex"
            @change="(index:number) => mValue.audioIndex = index"
            @cancle="mValue.isShowSelectSrc = false">
        </SongAudioSrcSelect>
    </PopWinBase>
</template>