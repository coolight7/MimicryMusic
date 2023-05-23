import { defineStore } from "pinia"

import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames"
import { MyErrTipStr_c, MyNetStateCode_e, Url_store } from "../Url"
import { Song_c } from "./Song";

import { Src_store } from "../Src"
import { MySrcInfo_c, MySrc_c } from "../../util/MySrc";
import { MyLogger, MyLogItem, myMapStringify } from "../../util/GlobalUtil";
import { PlayList_store } from "./PlayList";

export enum Playlist_access_e {
    Undefine = -1,
    Private = 0,	//私密
    Protected = 100,	//保护
    Public = 200	//公开
};
export enum Playlist_state_e {
    Undefine = -1,
    Normal = 200,
    Locked = 400,	//封禁
    Deleted = 410,	//已删除
    Error = 500	// 错误
};

export enum PlaylistEntity_type_e {
    Undefine = -1, Favory = 100, Local = 101, Normal = 200,
}

export class Playlist_c {
    pid: number = -1;
    uid: number = -1;
    icon: MySrc_c<MySrcInfo_c> = new MySrc_c<MySrcInfo_c>(new MySrcInfo_c());
    name: string = "";
    state: number = Playlist_state_e.Undefine;
    access: number = Playlist_access_e.Undefine;
    type: number = PlaylistEntity_type_e.Undefine;
    passwd: string = "";
    depict: string = "";
    listen: number = 0;
    love: number = 0;
    star: number = 0;
    song_num: number = 0;
    song = new Array<Song_c>();
    songAvailable: boolean = false;
    islove: boolean = false;
    isstar: boolean = false;
    created_time: number | null = null;
    lasted_time: number | null = null;

    constructor(
        pid: number = -1,
        uid: number = -1,
        icon: MySrc_c<MySrcInfo_c> | null = null,
        iconString: string = "",
        name: string = "",
        state : number = Playlist_state_e.Undefine,
        access: number = Playlist_access_e.Undefine,
        type: number = PlaylistEntity_type_e.Undefine,
        passwd: string = "",
        depict: string = "",
        listen: number = 0,
        love: number = 0,
        star: number = 0,
        song_num: number = 0,
        song: Array<Song_c> | null = null,
        songAvailable: boolean = false,
        islove: boolean = false,
        isstar: boolean = false,
        created_time: number | null = null,
        lasted_time: number | null = null,
    ) {
        this.pid = pid;
        this.icon = icon ?? MySrc_c.fromString(iconString, new MySrcInfo_c());
        this.uid = uid;
        this.name = name;
        this.state = state;
        this.access = access;
        this.type = type;
        this.passwd = passwd;
        this.depict = depict;
        this.listen = listen;
        this.love = love;
        this.star = star;
        this.song_num = song_num;
        this.song = song ?? new Array<Song_c>();
        this.songAvailable = songAvailable;
        this.islove = islove;
        this.isstar = isstar;
        this.created_time = created_time;
        this.lasted_time = lasted_time;
    }

    static fromJson(json: Map<string, any>): Playlist_c {
        let list = new Playlist_c(
            json["pid"] ?? -1,
            json["uid"] ?? -1,
            null,
            json["icon"] ?? "",
            json["name"] ?? "",
            json["state"] ?? Playlist_state_e.Undefine,
            json["access"] ?? Playlist_access_e.Undefine,
            json["type"] ?? PlaylistEntity_type_e.Undefine,
            json["passwd"] ?? "",
            json["depict"] ?? "",
            json["listen"] ?? 0,
            json["love"] ?? 0,
            json["star"] ?? 0,
            json["song_num"] ?? 0,
            json["songAvailable"] ?? false,
            json["islove"] ?? false,
            json["isstar"] ?? false,
            json["created_time"],
            json["lasted_time"],
        );
        if (null != json["song"]) {
            try {
                let songs: Array<any> = json["song"];
                for (let i = 0; i < songs.length; ++i) {
                    list.addSong(Song_c.fromJson(songs[i]));
                }
            } catch (e) {
                MyLogger.severe(new MyLogItem(
                    "json['song'] 解析错误",
                    [
                        e,
                        json["song"].toString(),
                    ],
                ));
            }
        }
        return list;
    }

    static fromJsonStr(json: string): Playlist_c {
        try {
            return Playlist_c.fromJson(JSON.parse(json));
        } catch (e) {
            MyLogger.severe(new MyLogItem(
                "Json 解析失败",
                [e, json],
            ));
        }
        return new Playlist_c();
    }

    setSongs(in_songs: Array<Song_c> | null): void {
        if(null == in_songs) {
            this.song = [];
            this.song_num = 0;
            this.songAvailable = false;
        } else {
            this.song = in_songs;
            this.song_num = in_songs.length;
            this.songAvailable = true;
        }
    }

    addSong(in_song: Song_c): void {
        this.song.push(in_song);
        this.song_num = this.song.length;
        this.songAvailable = true;
    }

    addSongs(in_songs:Array<Song_c>):void {
        this.song.push(...in_songs);
        this.song_num = this.song.length;
        this.songAvailable = true;
    }

    toJsonStr_noSong():string {
        const remap = new Map<string, any>([
          ["pid", this.pid],
          ["uid", this.uid],
          ["icon", this.icon.toString()],
          ["name", this.name],
          ["access", this.access],
          ["type", this.type],
          ["passwd", this.passwd],
          ["depict", this.depict],
          ["listen", this.listen],
          ["love", this.love],
          ["star", this.star],
          ["song_num", this.song_num],
          ["songAvailable", false],
          ["islove", this.islove],
          ["isstar", this.isstar],
          ["created_time", this.created_time],
          ["lasted_time", this.lasted_time],
        ]);
        return myMapStringify(remap);
    }

    copyWith(
        pid:number | null = null,
        uid:number | null = null,
        icon:MySrc_c<MySrcInfo_c> | null = null,
        iconString:string = "",
        name:string | null = null,
        state:number | null = null,
        access:number | null = null,
        type:number | null = null,
        passwd : string | null = null,
        depict : string | null = null,
        listen : number | null = null,
        love : number | null = null,
        star : number | null = null,
        song : Array<Song_c>| null = null,
        song_num:number | null = null,
        songAvailable : boolean | null = null,
        islove : boolean | null = null,
        isstar : boolean | null = null,
        created_time : number | null = null,
        lasted_time : number | null = null,
      ) : Playlist_c {
        // 复制playlist_c
        const relist = new Playlist_c(
          pid ?? this.pid,
          uid ?? this.uid,
          icon ?? ((iconString.length == 0) ? this.icon.copyWith() : null),
          iconString,
          name ?? this.name,
          state ?? this.state,
          access ?? this.access,
          type ?? this.type,
          passwd ?? this.passwd,
          depict ?? this.depict,
          listen ?? this.listen,
          love ?? this.love,
          star ?? this.star,
          song_num ?? this.song_num,
          null,
          songAvailable ?? this.songAvailable,
          islove ?? this.islove,
          isstar ?? this.isstar,
          created_time ?? this.created_time,
          lasted_time ?? this.lasted_time,
        );
        if (null != song) {
          relist.song = song;
          if (null == songAvailable) {
            relist.songAvailable = true;
          }
        } else {
          // 复制内部songs
          for (let i = 0, len = this.song.length; i < len; ++i) {
            relist.song.push(this.song[i].copyWith());
          }
          if (null == songAvailable) {
            relist.songAvailable = this.songAvailable;
          }
        }
        return relist;
      }

};

export const PlayList_Lists_store = defineStore(StoreNames.playList.Lists, {
    state() {
        return {
            global_s: Global_store(),
            url_s: Url_store(),
            src_s: Src_store(),

            //是否显示
            isShow: {
                detail: true,
            },
            regex:{
                access:     new RegExp(Playlist_access_e.Private.toString() + "|" + Playlist_access_e.Protected.toString() + "|" + Playlist_access_e.Public.toString()),
                name:       /^.{1,50}$/,
                passwd:     /^[0-9a-zA-Z]{4,10}$/,
                depict:     /^[\w\W]{0,255}$/
            },

            default_src: {
                img: Src_store().img.default_list,
            },
        }
    },
    getters: {},
    actions: {
        //发送请求修改歌单信息
        post_editlist: async function (in_list:Playlist_c, 
            doErrTip:boolean = true):Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少歌单ID或输入信息"],
                [MyNetStateCode_e.PermissionError, "没有权限修改该歌单信息"],
                [MyNetStateCode_e.ValueError, "歌单信息修改失败"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.playList.set.list,
                null,
                {
                    pid:    in_list.pid,
                    name:   in_list.name,
                    icon:   in_list.icon.toString(),
                    access: in_list.access,
                    depict: in_list.depict,
                    passwd: in_list.passwd
                },
                errTipObj,
                doErrTip,
            );
            return myresp.isSuccess();
        },
        //加载一个播放列表中的song的内容
        load_playList_song:async function (
            in_list:Playlist_c, 
            doTip:boolean = true,
            ):Promise<Array<Song_c> | null> {
            if(in_list.pid < 0) {
                return null;
            }
            if(in_list.state != Playlist_state_e.Normal) {
                if(doTip) {
                    this.global_s.tip("不允许访问该歌单内容");
                }
                return null;
            }
            let data:any =  {
                pid: in_list.pid
            };
            if(in_list.passwd) {
                data.passwd = in_list.passwd;
            }
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "未输入歌单ID"],
                [MyNetStateCode_e.ValueError, "歌曲列表获取失败"],
                [MyNetStateCode_e.DeletedError, "该歌单已被删除"],
                [MyNetStateCode_e.LockedError, "该歌单已被锁定"],
                [MyNetStateCode_e.Exception, "歌曲列表获取失败"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.playList.get.song,
                data,
                doTip,
                errTipObj,
            );
            if(myresp.isSuccess(true)) {
                if(myresp.data.length > 0) {
                    const relist = Song_c.listFromJsonStr(myresp.data);
                    if(null != relist) {
                        in_list.songAvailable = true;
                        in_list.song = relist;
                        return in_list.song;
                    }
                } else {
                    return [];
                }
            }
            return null;
        },
        //播放列表点赞按钮
        list_like_click: async function (list:Playlist_c, doErrTip:boolean = true) :Promise<boolean> {
            if (list.pid > 0) {
                if (list.islove == false) {
                    const errTipObj = new MyErrTipStr_c();
                    errTipObj.addAll(new Map<number, string>([
                        [MyNetStateCode_e.ValueHiatusError, "缺少歌单ID"],
                        [MyNetStateCode_e.ValueError, "点赞失败"],
                        [MyNetStateCode_e.RepearError, "点赞成功"],
                    ]));
                    const myresp = await this.url_s.postServer_jwt(this.url_s.playList.add.like,
                        {
                            pid: list.pid
                        },
                        null,
                        errTipObj,
                        doErrTip);
                    if(true == myresp.isSuccess()) {
                        ++(list.love);
                        list.islove = true;
                        return true;
                    } else if (myresp.code == MyNetStateCode_e.RepearError) {
                        list.islove = true;
                        return true;
                    }
                }
            }
            return false;
        },
        //播放列表收藏按钮
        list_star_click:async function (list:Playlist_c, doErrTip:boolean = true) : Promise<boolean> {
            let rebool = false;
            if (list.pid > 0) {
                if (list.isstar == true) {
                    const errTipObj = new MyErrTipStr_c();
                    errTipObj.addAll(new Map<number, string>([
                        [MyNetStateCode_e.ValueHiatusError, "未输入歌单ID"],
                        [MyNetStateCode_e.ValueError, "取消收藏失败"],
                        [MyNetStateCode_e.RepearError, "取消收藏成功"],
                    ]));
                    if (confirm("是否取消收藏播放列表 " + list.name + " ?")) {
                        const myresp = await this.url_s.postServer_jwt(
                            this.url_s.playList.remove.star,
                            {
                                pid: list.pid
                            },
                            null,
                            errTipObj,
                            doErrTip);
                        if(true == myresp.isSuccess()) {
                            list.isstar = false;
                            (list.star)--;
                            rebool = true;
                        } else if(myresp.code == MyNetStateCode_e.RepearError) {
                            list.isstar = false;
                            rebool = true;
                        }
                    }
                } else {
                    const errTipObj = new MyErrTipStr_c();
                    errTipObj.addAll(new Map<number, string>([
                        [MyNetStateCode_e.ValueHiatusError, "缺少歌单ID"],
                        [MyNetStateCode_e.ValueError, "收藏失败"],
                        [MyNetStateCode_e.RepearError, "已收藏"],
                    ]));
                    const myresp = await this.url_s.postServer_jwt(
                        this.url_s.playList.add.star,
                        {
                            pid: list.pid
                        },
                        null,
                        errTipObj,
                        doErrTip);
                    if(true == myresp.isSuccess()) {
                        list.isstar = true;
                        ++(list.star);
                        rebool = true;
                    } else if(myresp.code == MyNetStateCode_e.RepearError) {
                        list.isstar = true;
                        rebool = true;
                    }
                }
            }
            if(true == rebool) {
                PlayList_store().load_playList_star();
            }
            return rebool;
        },
        isFormat_access:function(in_str:string) {
            return this.regex.access.test(in_str);
        },
        isFormat_name:function(in_str:string) {
            return this.regex.name.test(in_str);
        },
        isFormat_passwd:function(in_str:string) {
            return this.regex.passwd.test(in_str);
        },
        isFormat_depict:function(in_str:string) {
            return this.regex.depict.test(in_str);
        },
        showDetail: function () {
            this.isShow.detail = true;
        },
        closeDetail: function () {
            this.isShow.detail = false;
        }
    }
})