import { defineStore }      from "pinia"
import { MySongQuality_e, SongAudioSrcInfo_c, Song_store } from "../playList/Song";
import { AudioLyric_store } from "../lyric/Lyric";
import { Global_store }     from "../Global"
import { StoreNames }       from "../StoreNames";
import { Url_store }        from "../Url"
import { MySrcType_e, MySrc_c } from "../../util/MySrc";
import { PlayList_store } from "../playList/PlayList";

export const Audio_store = defineStore(StoreNames.audio.Audio, {
    state() {
        return {
            url_s:      Url_store(),
            song_s:     Song_store(),
            lyric_s:    AudioLyric_store(),

            isShow: {
                detail: true,
                info: true,
                progressBar: true,
                controlBtn: true,
            },
            enable:{    //功能启用控制
                lyric:{
                    barrageLrc:true,    //弹幕歌词
                }
            },

            audioPlayer: <any>undefined,
            audio_src: "",

            info_songThumb_width: "",
            /*进度条*/
            progress_style: "width:50%;",
            loadProgress_style: "width:77%;",
            //音量条
            volume_progress_style:"width:80%",

            canPlay: false,        /*是否可以播放音乐*/
            playing: false,        /*播放状态*/
            alltime: "00:00",      //歌曲总时长
            nowtime: "00:00",      //已播放时长
            volume: 0.8,           //音量值
            volume_cache: 0,       //存放修改前的音量值
            volume_userLast:0,     //用户最后调节的音量
            speed: 1,              //播放速度
        }
    },
    getters: {},
    actions: {
        init:function() {
            //设置初始音量
            this.audioPlayer.volume = this.volume;
            this.volume_userLast = this.volume;
        },
        // 修改播放资源
        resetSource:async function(srclist:Array<MySrc_c<SongAudioSrcInfo_c>>, quality:MySongQuality_e | null = null) : Promise<boolean> {
            this.audio_stop();
            let rebool:boolean = false;
            for (let i = 0, len = srclist.length; i < len; ++i) {
              // 循环尝试每一个资源，直到播放成功
              rebool = await this._resetSource(
                srclist[i],
                quality,
              );
              if (true == rebool) {
                break;
              }
            }
            if(false == rebool) {
                // 获取失败
                const playlist_s  = PlayList_store();
                playlist_s.songSrcAvailableShiftItemNum(
                    Song_store().selectSong,
                    null,
                    1,
                );
                playlist_s.next_click(false, true);
            }
            return rebool;
        },
        _resetSource:async function(src:MySrc_c<SongAudioSrcInfo_c>, quality:MySongQuality_e|null = null) : Promise<boolean> {
            // 记录读取缓存/转换后的src，用于最后的解析播放
            let useSrc:MySrc_c<SongAudioSrcInfo_c> = src;
            // TODO: 禁用bili
            if(useSrc.info.type == MySrcType_e.Bili) {
                return false;
            }
            // 默认的src 需要转换
            const srclist = await Song_store().audio_toUrl(useSrc);
            if(null == srclist || srclist.length == 0) {
                return false;
            }
            useSrc = srclist[0];
            switch(useSrc.info.type) {
                // 不允许播放本地文件
                case MySrcType_e.Local:
                case MySrcType_e.LocalCache:
                    return false;
            }
            this.audio_src = useSrc.src;
            return true;
        },
        /*加载开始事件*/
        audio_loadStart: function () {
            this.canPlay = false;
        },
        /*可播放事件*/
        audio_canplay: function () {
            this.canPlay = true;
            this.alltime = Global_store().showTime_HMS_f(this.audioPlayer.duration);
            this.audio_loadProgress();
        },
        /*加载事件*/
        audio_loadProgress: function () {
            let timeRanges = this.audioPlayer.buffered;
            let num = 0;
            /*获取已加载时长，然后除以歌曲时长，即可得到已加载比例*/
            if (timeRanges.length > 0)
                num = Math.floor(timeRanges.end(timeRanges.length - 1) * 100 / this.audioPlayer.duration);
            if (num > 100)
                num = 100;
            else if (num < 0)
                num = 0;
            this.loadProgress_style = ";width:" + num.toString() + "%;";
        },
        /*音量改变事件*/
        audio_volumeChange: function () {
            let caudio = this.audioPlayer;
            /*音量值在[0,1]*/
            this.volume = caudio.volume;
            this.volume_progress_style = ";width:" + (Math.floor(caudio.volume * 100)).toString() + "%;";
        },
        /*播放事件*/
        audio_play: function () {
            this.playing = true;
        },
        /*暂停事件*/
        audio_pause: function () {
            this.playing = false;
        },
        /*音乐播放长度改变事件*/
        audio_lengthChange: function () {
            let caudio = this.audioPlayer;
            if (!isNaN(caudio.duration)) {
                this.nowtime = Global_store().showTime_HMS_f(caudio.currentTime);
                this.progress_style = ";width:" + (Math.floor(caudio.currentTime / caudio.duration * 100)).toString() + "%;";
            } else {
                this.progress_style = ";width:0%;";
            }
            this.lyric_s.audio_currentTime = caudio.currentTime;
        },
        audio_play_shift: function(in_shift:number) {
            let caudio = this.audioPlayer;
            if (!isNaN(caudio.duration)) {
                let result = caudio.currentTime + in_shift;
                if(result >= 0 && result <= caudio.duration) {
                    caudio.currentTime = result;
                } else  if(result < 0) {
                    caudio.currentTime = 0;
                } else if(result > caudio.duration) {
                    caudio.currentTime = caudio.duration;
                }
            }
        },
        //切换资源并播放时需要执行的事情
        doPlay:function(errFun:Function | undefined = undefined) {
            // TODO：暂时禁用播放
            Global_store().tip("目前暂时禁用播放功能");
            return true;
            let caudio = this.audioPlayer;
            if (this.playing == true) {
                caudio.pause();
            }
            caudio.load();
            caudio.currentTime = 0;
            this.audio_doplay(errFun);
        },
        //播放音频，如果失败将自动切换下一首
        audio_doplay:function(errFun:Function | undefined = undefined) {
            let caudio = this.audioPlayer;
            if (caudio.error == null) {
                let _this = this;
                setTimeout(function () {
                    (caudio.play()).then(() => {}).catch(() => {
                        _this.audio_doplay();
                    })
                }, 1000);
            }else{
                if(errFun) {
                    errFun(caudio.error);
                }else{
                    Global_store().tip("该歌曲无法播放");
                }
            }
        },
        /*播放按钮*/
        play_click: function () {
            //如果没有加载元数据，则直接返回
            let caudio = this.audioPlayer;
            if (isNaN(caudio.duration)) {
                return;
            }
            if (caudio.paused == true) {  //音频为暂停状态
                this.audio_play_click();
            } else {
                this.audio_pause_click();
            }
        },
        //播放音频，附带淡入效果
        audio_play_click:function() {
            let caudio = this.audioPlayer;
            let _volume = this.volume_userLast;
            let num = 5;
            let little = _volume / num;
            caudio.volume = 0;
            caudio.play();
            //渐强音量过渡
            let interval = setInterval(function () {
                if((caudio.volume <= (1 - little)) && num > 0) {
                    --num;
                    caudio.volume += little;
                } else {
                    caudio.volume = _volume;
                    clearInterval(interval);
                }
            }, 100);
        },
        //停止播放，附带淡出效果
        audio_pause_click:function() {
            //等一段时间的音量过渡后再停止播放
            this.playing = false;
            let caudio = this.audioPlayer;
            let _volume = this.volume_userLast;
            let num = 5;
            let little = _volume / num;
            //渐弱音量过渡
            let interval = setInterval(function () {
                if((caudio.volume >= little) && num > 0) {
                    --num;
                    caudio.volume -= little;
                } else {
                    caudio.pause();
                    caudio.volume = _volume;
                    clearInterval(interval);
                }
            }, 100);
        },
        audio_stop:function() {
            this.audioPlayer.pause();
        },
        /*静音按钮*/
        volume_click() {
            let caudio = this.audioPlayer;
            if (caudio.volume == 0) {
                caudio.volume = this.volume_cache;
            } else {
                this.volume_cache = caudio.volume;
                caudio.volume = 0;
            }
            this.volume_userLast = caudio.volume;
        },
        volume_shift:function(in_shift:number) {
            let caudio = this.audioPlayer;
            let result = caudio.volume + in_shift;
            if(result > 1) {
                result = 1;
            } else if(result < 0){
                result = 0;
            }
            caudio.volume = result;
            this.volume_userLast = caudio.volume;
        },
        /*更改播放速度 [0.25,2] */
        shiftSpeed:function(in_shift:number) {
            let lspeed = this.speed + in_shift;
            if(lspeed > 2) {
                lspeed = 2;
            } else if(lspeed <= 0) {
                lspeed = 0.25;
            }
            this.audioPlayer.playbackRate = lspeed;
        },
        setSpeed: function (in_speed:number) {
            if (in_speed > 2 || in_speed < 0.25) {
                return;
            } else {
                this.audioPlayer.playbackRate = in_speed;
            }
        },
        audio_speedChange:function() {
            this.speed = this.audioPlayer.playbackRate;
        },
    }
});