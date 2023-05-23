import { defineStore }      from "pinia";

import { Device_store }     from "./Device";
import { User_store }       from "./user/User";
import { TipBar_store }     from "./tip/TipBar";
import { PlayList_store }   from "./playList/PlayList";
import { Song_c, Song_store } from "./playList/Song";
import { AudioLyric_store } from "./lyric/Lyric";
import { StoreNames }       from "./StoreNames";
import { Url_store }        from "./Url";
import { Playlist_c } from "./playList/Lists";

export const Global_store = defineStore(StoreNames.Global, {
    state: () => {
        return {
            isGlobal : true,
            version: 13,
        }
    },
    getters:{}, 
    actions:{
        signIn_todo:async function() {
            User_store().detailType_click(true);
            const playlist_s = PlayList_store();
            playlist_s.update_userinfo();
            //加载用户创建的播放列表和收藏的播放列表
            await playlist_s.load_playList_create();
            await playlist_s.load_playList_star();
            await playlist_s.load_playlist_favory();
            await AudioLyric_store().load_create();
        },
        signOut_todo:function() {
            Url_store().jwt_user = "";
            const playlist_s = PlayList_store();
            playlist_s.update_userinfo();
            //移除用户的创建的播放列表和收藏的播放列表
            playlist_s.remove_lists(0);
            playlist_s.remove_lists(1);
            playlist_s.remove_selectList();
            AudioLyric_store().remove_lrcList();
            User_store().detailType_click(false);
        },
        //显示提示信息
        tip:function(tipStr:string, time:number = -1) {
            TipBar_store().tip(tipStr, time);
        },
        //获得模板类型声明
        getTemp_event() {
            return {
                todo:true,
                isTodo:function() {
                    return this.todo;
                },
                preventDefault:function() {
                    this.todo = false;
                }
            };
        },
        /*切换播放资源*/
        play_song:async function(in_list:Playlist_c, in_song:Song_c):Promise<boolean> {
            let _this = this;
            //如果有传入in_song，则切换歌曲信息，否则尝试播放当前选择歌曲
            if(in_list) {
                PlayList_store().setSelectList(in_list);
            }
            if(in_song) {
                return await Song_store().setSelectSong(in_song);
            }
            return false;
        },
        //将dataUrl（baseURL）转二进制数据
        dataURLtoBlob: function (dataurl:string):Blob {
            let arr = dataurl.split(','), result = arr[0].match(/:(.*?);/);
            if(result && result.length > 1) {
                let mime = result[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], {
                    type: mime
                });
            } else {
                return new Blob();
            }
        },
        /*读取cookie*/
        //TODO 弃用unescape()
        getCookie: function (name:string) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        },
        /*转换时间显示为 [时:]分:秒*/
        showTime_HMS_f: function (in_time:number) :string {
            let re_str = "";
            let thour = Math.floor(in_time / 3600);
            let tminute = Math.floor((in_time % 3600) / 60);
            let tsecond = Math.floor(in_time % 60);
            if (thour > 0) {
                if (thour < 10) {
                    re_str += "0";
                }
                re_str += thour + ":";
            }
            if (tminute < 10) {
                re_str += "0";
            }
            re_str += tminute + ":";
            if (tsecond < 10) {
                re_str += "0";
            }
            re_str += tsecond;
            return re_str;
        },
        //转换时间显示 ， 显示 时:分
        showTime_HM_f: function (in_time:number) :string {
            let re_str = "";
            let thour = Math.floor(in_time / 3600);
            let tminute = Math.floor((in_time % 3600) / 60);
            if (thour < 10) {
                re_str += "0";
            }
            re_str += thour + ":";
            if (tminute < 10) {
                re_str += "0";
            }
            re_str += tminute;
            return re_str;
        },
        //获取元素的绝对位置
        getLocation_left: function (e:any) {
            let l = e.offsetLeft;
            while (e = e.offsetParent) {
                l += e.offsetLeft;
            }
            /*由于可能会有缩放，因此需要乘一个缩放比例*/
            return l * Device_store().view_zoom;
        },
        filterBvid:function(in_url:string) : string | null {
            let reg = RegExp('(BV[\\da-zA-Z]{10})');
            in_url.replace(' ', '');
            in_url.replace('\n', '');
            in_url.replace('\r', '');
            in_url.replace('\t', '');
            let result = in_url.match(reg);
            return (null != result) ? result[1] : null;
        }
    }
});