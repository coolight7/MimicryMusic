import { defineStore } from "pinia"
import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";
import { Song_store } from "../playList/Song";
import { AudioLyric_store } from "../lyric/Lyric";
import { Barrage_store } from "../barrage/Barrage";

export const Setting_store = defineStore(StoreNames.setting.Setting, {
    state() {
        return {
            global_s:   Global_store(),
            lyric_s:    AudioLyric_store(),
            song_s:     Song_store(),
            isable:{
                transition:true,
                fullScreen:false,
            },
            /*  动画效果
            *   0:  关闭
            *   10：低
            *   20：中
            *   30: 高
            *   100：自定义
            */
            animation:30,
            /* 主题
            *  1:极夜
            *  2:炫彩
            *  3:极昼
            */
            view: {
                type: 2
            },
        }
    },
    getters:{
        isable_barrageLrc:function(state) {
            return state.lyric_s.enable.barrageLrc;
        },
        isable_fullScreen:function(state) {
            return state.isable.fullScreen;
        },
        toBili_transitionType:function(state) {
            return state.song_s.toBili_transitionType;
        },
        isable_songThumb_wave:function(state) {
            return state.song_s.isable_songThumb_wave;
        },
        isable_songThumb_rotate:function(state) {
            return state.song_s.isable_songThumb_rotate;
        }
    },
    actions:{
        setViewType:function(in_type:number) {
            if (this.view.type == in_type)
                return;
            let body = document.getElementsByTagName('body')[0];
            switch (in_type) {
                case 1: {
                    body.classList.remove("fun_body");
                    body.classList.remove("sun_body");
                    body.classList.add("ngint_body");
                } break;
                case 2: {
                    body.classList.remove("sun_body");
                    body.classList.remove("ngint_body");
                    body.classList.add("fun_body");
                } break;
                case 3: {
                    body.classList.remove("fun_body");
                    body.classList.remove("ngint_body");
                    body.classList.add("sun_body");
                } break;
            }
            this.view.type = in_type;
        },
        set_toBili_transitionType:function(in_type:number) {
            if(in_type != 1 && in_type != 2) {
                return;
            }
            this.song_s.toBili_transitionType = in_type;
        },
        set_animation:function(in_animation:number) {
            if(this.animation == in_animation) {
                return;
            }
            this.animation = in_animation;
            let body = document.getElementsByTagName('body')[0];
            switch(this.animation) {
                case 0:{    //关闭
                    this.set_isable_songThumb_wave(false);
                    this.set_isable_songThumb_rotate(false);
                    this.set_transition(false);
                }break;
                case 10: {  //低
                    this.set_isable_songThumb_wave(false);
                    this.set_isable_songThumb_rotate(true);
                    this.set_transition(true);
                }break;
                case 20:{   //中
                    this.set_isable_songThumb_wave(true);
                    this.set_isable_songThumb_rotate(true);
                    this.set_transition(true);
                }break;
                case 30:{   //高
                    this.set_isable_songThumb_wave(true);
                    this.set_isable_songThumb_rotate(true);
                    this.set_transition(true);
                }break;
            }
        },
        set_transition:function(in_bool:boolean) {
            if(this.isable.transition == in_bool) {
                return;
            }
            this.isable.transition = in_bool;
            let body = document.getElementsByTagName('body')[0];
            if(this.isable.transition) {
                body.classList.remove("noTransition");
            } else {
                body.classList.add("noTransition");
            }
        },
        set_isable_songThumb_wave:function(in_bool:boolean) {
            this.song_s.set_isable_songThumb_wave(in_bool);
        },
        set_isable_songThumb_rotate:function(in_bool:boolean) {
            this.song_s.set_isable_songThumb_rotate(in_bool);
        },
        //弹幕歌词
        enable_barrageLrc:function() {
            this.lyric_s.enable.barrageLrc = true;
        },
        disable_barrageLrc:function() {
            this.lyric_s.enable.barrageLrc = false;
            Barrage_store().clear();
        },
        enable_fullScreen:function() {
            let _this = this;
            const html = document.querySelector('html')
            if(html) {
                html.requestFullscreen()
                .then(() => {
                  _this.isable.fullScreen = true;
                })
                .catch(() => {
                    _this.isable.fullScreen = false;
                  _this.global_s.tip("进入全屏失败");
                })
            }
        },
        disable_fullScreen:function() {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((<any>document).mozExitFullScreen) {
                (<any>document).mozExitFullScreen();
            } else if ((<any>document).webkitExitFullscreen) {
                (<any>document).webkitExitFullscreen();
            }
            this.isable.fullScreen = false;
        },
    }
})