import { defineStore } from "pinia"
import { myArrayStringify, MyLogger, MyLogItem, myMapStringify } from "../../util/GlobalUtil";

import { StoreNames } from "../StoreNames";
import { MyNetStateCode_e, Url_store, MyErrTipStr_c } from "../Url"

export class LyricItem_c {
    protected time:number = -1;
    protected timeStr:string = "";
    content:string = "";

    constructor(in_time:number = -1, in_content:string = "") {
        this.time = in_time;
        this.timeStr = AudioLyric_store().numtimeToLrctime(this.time);
        this.content = in_content;
    };

    get_time() {
        return this.time;
    }
    get_timeStr() {
        return this.timeStr;
    }
    set_time(in_time:number):void {
        if(in_time > 0) {
            this.time = in_time;
            this.timeStr = AudioLyric_store().numtimeToLrctime(this.time);
        } else {
            this.time = 0;
            this.timeStr = "00:00.00";
        }
    }
    set_timeStr(in_timeStr:string):void {
        let time = AudioLyric_store().lrctimeTonumtime(in_timeStr);
        if(time > 0) {
            this.timeStr = in_timeStr;
            this.time = time;
        } else {
            this.time = 0;
            this.timeStr = "00:00.00";
        }
    }

    static fromJson(json:Map<string, any>):LyricItem_c {
        return new LyricItem_c(
          json["time"] ?? -1,
          json["content"] ?? "",
        );
    }

    static fromJsonStr(in_str:string):LyricItem_c {
        return LyricItem_c.fromJson(JSON.parse(in_str));
    }

     toJson():Map<string, any> {
        const remap = new Map<string, any>(
            [
                ["time", this.time],
                ["content", this.content],
            ]
        );
        return remap;
      }
      toString():string {
        return myMapStringify(this.toJson());
      }
};

export class LyricSrc_c {
    /*
        [ar:艺人名]
        [ti:曲名]
        [al:专辑名]
        [by:编者（指编辑LRC歌词的人）]
        [offset:时间补偿值] 其单位是毫秒，正值表示整体提前，负值相反。这是用于总体调整显示快慢的。
    */
    ti:string = "";
    ar:string = "";
    al:string = "";
    by:string = "";
    lrc = new Array<LyricItem_c>();

    constructor(
        ti:string = "",
        ar:string = "",
        al:string = "",
        by:string = "",
    ) {
        this.ti = ti;
        this.ar = ar;
        this.al = al;
        this.by = by;
    }

    //将没有函数的lrc转为有函数的类
    static insert_function(in_lrc:Array<LyricItem_c>) {
        class LyricItemStruct_c {
            time:number = -1;
            timeStr:string = "";
            content:string = "";
        };
        for(let i = 0; i < in_lrc.length; ++i) {
            if(!in_lrc[i].get_time) {  //不存在函数
                let lrcItem = <LyricItemStruct_c>(<unknown>(in_lrc[i]));
                let item = new LyricItem_c(lrcItem.time, lrcItem.content);
                in_lrc[i] = item;
            }
        }
    }

    static fromJson(json: Map<string, any>):LyricSrc_c {
        let reLrcSrc = new LyricSrc_c(
            json["ti"] ?? "",
            json["ar"] ?? "",
            json["al"] ?? "",
            json["by"] ?? "",
        );
        if(json["lrc"]) {
            try{
                let list:Array<Map<string, any>> = [];
                if(typeof json["lrc"] == 'string') {
                    list = JSON.parse(json["lrc"]);
                } else {
                    list = json["lrc"];
                }
                for(let i = 0; i < list.length; ++i) {
                    reLrcSrc.lrc.push(LyricItem_c.fromJson(list[i]));
                }
            } catch(e) {
                MyLogger.severe(new MyLogItem(
                    "json['lrc']解析错误",
                    [e, json['lrc']],
                ));
            }
        } else {
            reLrcSrc.lrc = new Array<LyricItem_c>();
        }
        return reLrcSrc;
    }

    //从json字符串转回LyricSrc_c对象，直接使用JSON.parse()会丢失对象的函数
    static fromJsonStr(in_str:string):LyricSrc_c {
        return LyricSrc_c.fromJson(JSON.parse(in_str));
    }

    toJson():Map<string, any> {
        const remap = new Map<string, any>([
            ["ti", this.ti],
            ["ar", this.ar],
            ["al", this.al],
            ["by", this.by],
        ]);
        let lrclist = myArrayStringify(this.lrc, (item, index) => {
            return item.toString();
        });
        remap.set("lrc", lrclist);
        return remap;
      }

    toString():string{
        return myMapStringify(this.toJson());
      }
};

export enum Lyric_copyright_e {
    Undefine    = -1,
    Original	= 10,		//原创
	Reprint		= 20        //转载
}
export enum Lyric_access_e {
    Undefine	= -1,
    Private		= 0,
    Public		= 200
}
export enum Lyric_state_e {
    Undefine    = -1,
    Normal      = 200,
    Locked      = 400,	//封禁
    Deleted     = 410,	//已删除
    Error       = 500	// 错误
};

export enum LyricEntity_type_e {
    Undefine = -1, Local = 101, Normal = 200,
}

export class Lyric_c {
    lrcid:number            = -1;
    uid:number              = -1;
    copyright               = Lyric_copyright_e.Undefine;
    state                   = Lyric_state_e.Undefine;
    access                  = Lyric_access_e.Undefine;
    type:LyricEntity_type_e = LyricEntity_type_e.Undefine;
    name:string             = "";
    artist:string           = "";
    depict:string           = "";
    love:number             = 0;
    used:number             = 0;
    src                     = new LyricSrc_c();
    srcAvailable:boolean    = false;
    islove:boolean          = false;
    isused:boolean          = false;
    created_time: number | null = null;
    lasted_time: number | null = null;

    constructor(
        lrcid: number = -1,
        uid: number = -1,
        copyright: Lyric_copyright_e = Lyric_copyright_e.Undefine,
        state: Lyric_state_e = Lyric_state_e.Undefine,
        access: Lyric_access_e = Lyric_access_e.Undefine,
        type: LyricEntity_type_e = LyricEntity_type_e.Undefine,
        name:string = "",
        artist:string = "",
        depict:string = "",
        love:number = 0,
        used:number = 0,
        srcAvailable:boolean = false,
        islove:boolean = false,
        isused:boolean = false,
        created_time: number | null = null,
        lasted_time: number | null = null,
      ) {
        this.lrcid = lrcid;
        this.uid = uid;
        this.copyright = copyright;
        this.state = state;
        this.access = access;
        this.type = type;
        this.name = name;
        this.artist = artist;
        this.depict = depict;
        this.love = love;
        this.used = used;
        this.srcAvailable = srcAvailable;
        this.islove = islove;
        this.isused = isused;
        this.created_time = created_time;
        this.lasted_time = lasted_time;
      }

    static fromJson (json:Map<string, any>):Lyric_c {
        const lyric = new Lyric_c(
            json["lrcid"] ?? -1,
            json["uid"] ?? -1,
            json["copyright"] ?? Lyric_copyright_e.Undefine,
            json["state"] ?? Lyric_state_e.Undefine,
            json["access"] ?? Lyric_access_e.Undefine,
            json["type"] ?? LyricEntity_type_e.Undefine,
            json["name"] ?? "",
            json["artist"] ?? "",
            json["depict"] ?? "",
            json["love"] ?? 0,
            json["used"] ?? 0,
            json["srcAvailable"] ?? false,
            json["islove"] ?? false,
            json["isused"] ?? false,
            json["created_time"],
            json["lasted_time"],
        );
        if (null != json["src"] && json["src"].isNotEmpty) {
            // 尝试写入src
            try {
              lyric.src = LyricSrc_c.fromJson(json["src"]);
            } catch (e) {
              MyLogger.severe(new MyLogItem(
                "json['src'] 解析错误",
                [e, json["src"].toString()],
              ));
            }
          }
        return lyric;
    }

    static fromJsonStr(in_str:string):Lyric_c {
        let lyric = <Lyric_c>JSON.parse(in_str);
        LyricSrc_c.insert_function(lyric.src.lrc);
        return lyric;
    }

    copyWith() :Lyric_c {
        return JSON.parse(JSON.stringify(this));
    }
};

export const AudioLyric_store = defineStore(StoreNames.audio.Lyric, {
    state() {
        return {
            url_s:      Url_store(),
            enable:{
                barrageLrc:true
            },
            regex:{
                name:       /^[^\s\'\"\\]{1,1000}$/,
                artist:     /^[^\s\'\"\\]{0,100}$/,
                copyright:  new RegExp(Lyric_copyright_e.Original + "|" + Lyric_copyright_e.Reprint),
                access:     new RegExp(Lyric_access_e.Private + "|" + Lyric_access_e.Public),
                depict:     /^.{0,255}$/
            },
            lrcList:new Array<Lyric_c>(),
            //存储用户指定歌曲使用的歌词的映射
            songLrcMap:new Map<number, number>(),   //<sid, lrcid>
            //缓存
            lrcSrcCache:new Map<number, LyricSrc_c>(),
            audio_currentTime:0,
            isShow:{
                detail:true,
                bar:true,
                edit:false,
                list:true
            }
        }
    },
    getters: {
        getLyricList:function(state) {
            return state.lrcList;
        }
    },
    actions: {
        //查找in_time对应的歌词项下标
        findItemByTime:function(in_list:Array<LyricItem_c>, in_time:number, offsetTime:number = 0) :number {
            if(!(in_time > 0)) {
                return 0;
            }
            for(let i = 0, len = in_list.length; i < len; ++i) {
                if(in_time == (in_list[i].get_time() - offsetTime)) {
                    return i;
                } else if(in_time < (in_list[i].get_time() - offsetTime)) {
                    if(i == 0) {
                        return 0;
                    } else {
                        return i - 1;
                    }
                }
            }
            return in_list.length - 1;
        },
        //转换数值时间为歌词样式
        //in_num:单位（s）
        //返回：分:秒.(毫秒/10)
        numtimeToLrctime:(in_num:number) => {
            if(in_num > 0) {
                let minute = Math.floor(in_num / 60);
                let second = Math.floor(in_num) % 60;
                let msecond = Math.floor(in_num * 1000 % 1000 / 10);
                let restr = "";
                if(minute < 10) {
                    restr += "0";
                }
                restr += minute + ":";
                if(second < 10) {
                    restr += "0";
                }
                restr += second + ".";
                if(msecond < 10) {
                    restr += "0";
                }
                restr += msecond;
                return restr;
            } else {
                return "00:00.00";
            }
        },
        lrctimeTonumtime:(in_lrc:string) => {
            let result1 = in_lrc.split(":");
            let result2 = (result1[1]).split(".");
            if(result1[0] && result2[0] && result2[1]) {
                return parseInt(result1[0]) * 60 + parseInt(result2[0]) + parseInt(result2[1]) / 100;
            } else {
                return 0;
            }
        },
        //解析歌词字符串
        parseLyric:function (lyric:string) :LyricSrc_c {
            const lrcObj = new LyricSrc_c();
            const lrcArr = lyric.split("\n")
                .filter(function (value) {
                    // 1.通过回车去分割歌词每一行,遍历数组，去除空行
                    return value.trim() !== "";
                })
                .map(function (value) {
                    // 2.解析歌词
                    const line = parseLyricLine(value.trim());
                    switch(line.type) {
                        case "lrc":{
                            lrcObj.lrc.push(line.data);
                        }break;
                        case "ti":{
                            lrcObj.ti = line.data.content;
                        }break;
                        case "ar":{
                            lrcObj.ar = line.data.content;
                        }break;
                        case "al":{
                            lrcObj.al = line.data.content;
                        }break;
                        case "by":{
                            lrcObj.by = line.data.content;
                        }break;
                    }
                    return value.trim();
                });
            /*
            lyric.replace(/(\n[\s\t]*\r*\n)/g, '\n')
                .replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '')
                .split('\n');
            */

            function parseLyricLine(line:string) {
                const tiArAlByExp = /^\[(ti|ar|al|by):(.*)\]$/;
                const lyricExp = /^\[(\d+):(\d+).(\d+)\](.*)/;
                let result;
                if ((result = line.match(tiArAlByExp)) !== null) {
                    return {
                        type: result[1],
                        data: new LyricItem_c(-1, result[2]),
                    };
                } else if ((result = line.match(lyricExp)) !== null) {
                    return {
                        type: "lrc",
                        data: new LyricItem_c(parseInt(result[1]) * 60 + parseInt(result[2]) + parseInt(result[3]) / 1000, result[4].trim())
                    };
                } else {
                    return {
                        type: "lrc",
                        data: new LyricItem_c(-1, line)
                    };
                }
            }
            return lrcObj;
        },
        //获取lrcid数组指定的歌词基本信息
        load_lyric_bylrcids:async function (
            lrcidArr:Array<number>,
            doErrTip:boolean = true
        ) : Promise<Array<Lyric_c> | null> {
            if (lrcidArr.length > 0) {
                let url = this.url_s.lyric.get.info + "?lrcid=" + lrcidArr[0];
                for (let i = 1, len = lrcidArr.length; i < len; ++i) {
                    url = url + "&lrcid=" + lrcidArr[i];
                }
                const errTipObj = new MyErrTipStr_c();
                errTipObj.addAll(new Map<number, string>([
                    [MyNetStateCode_e.ValueHiatusError, "未输入歌词ID"],
                    [MyNetStateCode_e.ValueError, "歌词信息加载失败"],
                ]));
                const myresp = await this.url_s.getServer_jwt(
                    url,
                    {},
                    doErrTip,
                    errTipObj,
                );
                if(myresp.isSuccess()) {
                    let reData = <Array<any>>myresp.data;
                    let data = new Array<Lyric_c>();
                    reData.forEach((value, index, array) => {
                        data.push(Lyric_c.fromJson(value));
                    });
                    for (let i = data.length; i-- > 0;) {
                        data[i].src = new LyricSrc_c();
                        data[i].srcAvailable = false;
                        data[i].islove = false;
                        data[i].isused = false;
                    }
                    for (let i = 0, j = 0; i < lrcidArr.length && j < data.length; ++i) {
                        let k = j;
                        for (; k < data.length && data[k].lrcid != lrcidArr[i]; ++k);
                        if (k != data.length) {
                            let temp = data[j];
                            data[j] = data[k];
                            data[k] = temp;
                            ++j;
                        }
                    }
                    return data;
                }
            }
            return null;
        },
        //获取用户创建的歌词
        load_create: async function(doErrTip:boolean = true)  : Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.Exception, "加载用户创建的歌词失败"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.lyric.get.create,
                {},
                doErrTip,
                errTipObj,
            );
            if(myresp.isSuccess()) {
                const relist = await this.load_lyric_bylrcids(myresp.data, doErrTip);
                if(null != relist) {
                    this.lrcList = relist;
                    return true;
                }
            }
            return false;
        },
        //获取歌词内容
        load_lyric_src:async function(
            in_lyric:Lyric_c, 
            doErrTip:boolean = true
        ) : Promise<LyricSrc_c | null> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "未输入歌词ID"],
                [MyNetStateCode_e.ValueError, "歌词内容加载失败"],
                [MyNetStateCode_e.DeletedError, "该歌词已被删除"],
                [MyNetStateCode_e.LockedError, "该歌词已被锁定"],
                [MyNetStateCode_e.PermissionError, "权限不足，获取歌词内容时被拒绝"],
                [MyNetStateCode_e.Exception, "服务器错误"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.lyric.get.src,
                {
                    "lrcid":in_lyric.lrcid
                },
                doErrTip,
                errTipObj,
            );
            if(myresp.isSuccess()) {
                in_lyric.srcAvailable = true;
                if(myresp.data.length > 0) {
                    in_lyric.src = LyricSrc_c.fromJsonStr(myresp.data);
                } else {
                    in_lyric.src = new LyricSrc_c();
                }
                return in_lyric.src;
            }
            return null;
        },
        get_lrcSrc:async function(
            in_lrcid:number, 
            doErrTip:boolean = true
        ) : Promise<LyricSrc_c | null> {
            if (in_lrcid < 0) {
                return null;
            }
            let value = this.lrcSrcCache.get(in_lrcid);
            if (value) {     //如果存在缓存
                return value;
            } else {
                let temp = new Lyric_c();
                temp.lrcid = in_lrcid;
                const reSrc = await this.load_lyric_src(temp, doErrTip);
                if(null != reSrc) {
                    this.lrcSrcCache.set(
                        in_lrcid,
                        reSrc,
                    );
                    return reSrc;
                }
            }
            return null;
        },
        songLrcMap_set:function(in_sid:number, in_lrcid:number) {
            this.songLrcMap.set(in_sid, in_lrcid);
        },
        songLrcMap_get:function(in_sid:number) {
            return this.songLrcMap.get(in_sid);
        },
        //创建
        post_add_create_lyric:async function(
            in_lyric:Lyric_c,
            doErrTip:boolean = true
        ) : Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "创建歌词所需的输入信息不足"],
                [MyNetStateCode_e.Exception, "歌词创建失败"],
            ]));
            const myresp = await this.url_s.postServer_json_jwt(this.url_s.lyric.add.create,
                {
                    "name":in_lyric.name,
                    "artist": in_lyric.artist,
                    "copyright":in_lyric.copyright,
                    "access":in_lyric.access,
                    "depict":in_lyric.depict
                },
                in_lyric.src.toString(),
                doErrTip,
                errTipObj,
            );
            const rebool = myresp.isSuccess();
            if(true == rebool) {
                this.load_create();
            }
            return rebool;
        },
        //删除
        post_remove_create_lyric:async function(
            in_lyric:Lyric_c, 
            doErrTip:boolean = true
        ) :Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少希望删除的歌词ID"],
                [MyNetStateCode_e.PermissionError, "没有权限删除该歌词"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.lyric.remove.create,
                {
                    "lrcid":in_lyric.lrcid
                },
                null,
                errTipObj,
                doErrTip,
            );

            const rebool = myresp.isSuccess();
            if(true == rebool) {
                this.load_create();
            }
            return rebool;
        },
        //修改歌词基本信息
        post_set_create_info: async function(
            in_lyric:Lyric_c,
            doErrTip:boolean = true
        )  : Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少希望修改的歌词ID"],
                [MyNetStateCode_e.PermissionError, "没有权限修改该歌词信息"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.lyric.set.info,
                null,
                {
                    "lrcid":in_lyric.lrcid,
                    "name":in_lyric.name,
                    "artist": in_lyric.artist,
                    "copyright":in_lyric.copyright,
                    "access":in_lyric.access,
                    "depict":in_lyric.depict
                },
                errTipObj,
                doErrTip);
            const rebool = myresp.isSuccess();
            if(true == rebool ) {
                this.load_create();
            }
            return rebool;
        },
        //修改歌词内容
        post_set_create_src: async function(
            in_lyric:Lyric_c,
            doErrTip:boolean = true
        ) :Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少希望修改的歌词ID"],
                [MyNetStateCode_e.ValueError, "歌词内容修改失败"],
                [MyNetStateCode_e.PermissionError, "没有权限修改该歌词内容"],
            ]));
            const myresp = await this.url_s.postServer_json_jwt(
                this.url_s.lyric.set.src,
                {
                    "lrcid":in_lyric.lrcid
                },
                in_lyric.src.toString(),
                doErrTip,
                errTipObj,
            );
            return myresp.isSuccess();
        },
        //重排序创建的歌词列表
        post_order_create:async function(
            in_lrcids:Array<number>, 
            doErrTip:boolean = true
        ) : Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "未输入歌词ID"],
                [MyNetStateCode_e.ValueError, "歌词重排序失败"],
            ]));
            const myresp = await this.url_s.postServer_json_jwt(this.url_s.lyric.order.create,
                {},
                JSON.stringify(in_lrcids),
                doErrTip,
                errTipObj,
            );
            const rebool = myresp.isSuccess();
            if(true == rebool) {
                this.load_create();
            }
            return myresp.isSuccess();
        },
        //点赞
        lyric_like_click: async function(in_lyric:Lyric_c, doErrTip:boolean = true) : Promise<boolean> {
            let rebool:boolean = false;
            if (in_lyric.lrcid > 0) {
                if (in_lyric.islove == false) {
                    const errTipObj = new MyErrTipStr_c();
                    errTipObj.addAll(new Map<number, string>([
                        [MyNetStateCode_e.ValueHiatusError, "未输入歌词ID"],
                        [MyNetStateCode_e.ValueError, "点赞失败"],
                        [MyNetStateCode_e.RepearError, "已点赞"],
                    ]));
                    const myresp = await this.url_s.postServer_jwt(
                        this.url_s.lyric.add.like,
                        {
                            "lrcid": in_lyric.lrcid
                        },
                        null,
                        errTipObj,
                        doErrTip);
                    rebool = myresp.isSuccess();
                    if(true == rebool) {
                        ++(in_lyric.love);
                        in_lyric.islove = true;
                    }
                }
            }
            return rebool;
        },
        remove_lrcList:function() {
            this.lrcList = new Array<Lyric_c>();
        },
    }
});