import { defineStore } from "pinia"
import { Global_store } from "../Global"
import { Url_store } from "../Url";
import { UserData_c, User_store } from "../user/User";
import { PlayList_store } from "../playList/PlayList";
import { StoreNames } from "../StoreNames";
import { AudioLyric_store, Lyric_c } from "../lyric/Lyric";
import { Playlist_c } from "../playList/Lists";
import { Song_c } from "../playList/Song";

export const Search_store = defineStore(StoreNames.search.Search, {
    state:() => {
        return {
            global_s: Global_store(),
            url_s: Url_store(),
            user_s: User_store(),
            playlist_s: PlayList_store(),

            isShow: {
                detail: true,
                showResult: 0,
            },
            showType: 0,       //显示类型
            tipStr: "",        //自定义提示内容
            placeStr: "请输入搜索内容",  //搜索框为空时提示内容
            type: 1,           //搜索类型
            str: "",           //搜索字符串
            result_lists: new Array<Playlist_c>,  //搜索结果
            result_songs: new Array<Song_c>,
            result_users: new Array<UserData_c>,

            lock: {
                short_time: 3000,
                time: 10000,
                getResult: true,
                getLists: true,
                getSongs: true,
                getUsers: true,
            }
        }
    },
    getters: {},
    actions: {
        //搜索
        search_result_click: function () {
            if (!this.str || this.lock.getResult == false) {
                return;
            }
            this.lock.getResult = false;
            this.post_search(this.type, this.str);
            let _this = this;
            setTimeout(function () {
                _this.lock.getResult = true;
            }, this.lock.short_time);
        },
        /*搜索类型选择按钮*/
        search_type_click: function (index:number) {
            if (this.type == index || this.showType == index) {
                return;
            }
            this.type = index;
            this.showType = index;
            switch (index) {
                case 1: {
                    this.placeStr = "搜索歌单";
                    if (this.lock.getLists == false) {
                        return;
                    } else {
                        this.lock.getLists = false;
                        let _this = this;
                        setTimeout(function () {
                            _this.lock.getLists = true;
                        }, this.lock.time);
                    }
                } break;
                case 2: {
                    this.placeStr = "搜索歌曲";

                } break;
                case 3: {
                    this.placeStr = "搜索用户";
                    if (this.lock.getUsers == false) {
                        return;
                    } else {
                        this.lock.getUsers = false;
                        let _this = this;
                        setTimeout(function () {
                            _this.lock.getUsers = true;
                        }, this.lock.time);
                    }
                } break;
                default: {
                    return;
                } break;
            }
            this.post_search(index, this.str);
        },
        //发送请求搜索
        post_search:async function (type:number, str:string, doErrTip:boolean = true) : Promise<boolean> {
            if (!str) {
                return false;
            }
            let url = this.url_s.search.list;
            if (type == 2) {
                url = this.url_s.search.song;
            } else if (type == 3) {
                url = this.url_s.search.user;
            }
            const myresp = await this.url_s.getServer_jwt(
                url,
                {
                    'str': str,
                },
                doErrTip
            );
            if(myresp.isSuccess(true)) {
                if(myresp.data.length > 0) {
                    if (type == 2) {

                    } else if (type == 3) {
                        const relist = await this.user_s.load_users_byuids(
                            myresp.data,
                            doErrTip);
                        if(null != relist) {
                            this.result_users = relist;
                        }
                    } else {
                        //将cplayid数组换取列表数据
                        const relist = await this.playlist_s.load_lists_byPids(
                            myresp.data,
                            doErrTip);
                        if(null != relist) {
                            this.result_lists = relist;
                        }
                    }
                    this.showType = this.type;
                } else {
                    this.showType = 10;
                    this.tipStr = "暂无搜索结果";
                }
                return true;
            }
            return false;
        },
        post_search_lyric:async function(in_str:string,
            doErrTip:boolean = true) : Promise<Array<Lyric_c> | null> {
            if(!in_str) {
                return null;
            }
            const myresp  = await this.url_s.getServer_jwt(
                this.url_s.search.lyric,
                {
                    "str":in_str
                },
                doErrTip
            );
            if(myresp.isSuccess(true)) {
                if(myresp.data.length > 0) {
                    return AudioLyric_store().load_lyric_bylrcids(myresp.data);
                }
                return [];
            }
            return null;
        },
        //显示/隐藏设置窗口
        showDetail: function () {
            this.isShow.detail = true;
        },
        closeDetail: function () {
            this.isShow.detail = false;
        }
    }
});