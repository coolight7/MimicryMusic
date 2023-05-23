import { defineStore } from "pinia"
import {MySrcTypeStr_e, MySrc_c, MySrcInfo_c, MySrcType_e} from "../../util/MySrc";
import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames"
import { ErrValue_c, Url_store } from "../Url"

import { Src_store } from "../Src"
import { MyLogger, MyLogItem, myMapStringify } from "../../util/GlobalUtil";
import { Audio_store } from "../audio/Audio";
import { PlayList_store } from "./PlayList";

export enum SongEntity_type_e {
    Undefine = -1, Favory = 100, Local = 101, Normal = 200,
}

/// 歌曲源文件质量标记
export enum MySongQuality_e {
    Undefined,
    Lower, // 尽量低
    Standard, // 标准
    HQ, // 高
    SQ, // 超高
    Hifi, // 高保真
    Upper, // 尽量高
  }

export class MySongQuality_c {
    static Lower:number = Number.NEGATIVE_INFINITY;
    static Standard:number = 0;// [0, 128]
    static HQ:number = 128;// (128, 320]
    static SQ:number = 320;// (320, 1411)
    static Hifi:number = 1411;// [1411, ~]
    static Upper:number = Number.POSITIVE_INFINITY;
  
    static intToQuality(quality:number|null):MySongQuality_e | null {
      switch(quality) {
        case 0:
          return MySongQuality_e.Undefined;
        case 1:
          return MySongQuality_e.Lower;
        case 100:
          return MySongQuality_e.Upper;
        case 10:
          return MySongQuality_e.Standard;
        case 20:
          return MySongQuality_e.HQ;
        case 30:
          return MySongQuality_e.SQ;
        case 40:
          return MySongQuality_e.Hifi;
      }
      return null;
    }
  
    static qualityToInt(quality:MySongQuality_e):number {
      switch(quality){
        case MySongQuality_e.Undefined:
          return 0;
        case MySongQuality_e.Lower:
          return 1;
        case MySongQuality_e.Upper:
          return 100;
        case MySongQuality_e.Standard:
          return 10;
        case MySongQuality_e.HQ:
          return 20;
        case MySongQuality_e.SQ:
          return 30;
        case MySongQuality_e.Hifi:
          return 40;
      }
    }
  
    static compareTo(left:MySongQuality_e, right:MySongQuality_e):number {
      if(left == right) {
        return 0;
      }
      return (MySongQuality_c.qualityToInt(left) - MySongQuality_c.qualityToInt(right));
    }
  
    static getQuality(kbps:number):MySongQuality_e {
      if(kbps >= MySongQuality_c.Hifi) {
        return MySongQuality_e.Hifi;
      } else if(kbps > MySongQuality_c.SQ) {
        return MySongQuality_e.SQ;
      } else if(kbps > MySongQuality_c.HQ) {
        return MySongQuality_e.HQ;
      } else {
        return MySongQuality_e.Standard;
      }
    }
  
    /// 计算源文件质量
    /// [size]：文件大小，单位：bit
    /// [duration] : 歌曲时长，单位：ms
    static getQuality_bySizeDur(size:number, duration:number):MySongQuality_e {
      if(size <= 0 || duration <= 0) {
        return MySongQuality_e.Standard;
      }
      // 计算 kbit/s
      const wight = (size / 1024) / (duration / 1000);
      return MySongQuality_c.getQuality(wight);
    }
  }

export class SongInfoEntity_c {
    name:string = ""; // 名称
    artist:string = ""; // 艺术家
    album:string = ""; // 专辑
    duration:number = -1; // 时长， 单位：ms
    listen_num:number = 0; // 播放次数
    created_time:number = 0; // 创建时间, 单位：s
    lasted_time:number = 0; // 最后修改时间，单位：s
  
    constructor(
      name:string = "",
      artist:string = "",
      album:string = "",
      duration:number = -1,
      listen_num:number = 0,
      created_time:number = 0,
      lasted_time:number = 0,
    ) {}

    static fromJson(json:Map<string, any>):SongInfoEntity_c {
        return new SongInfoEntity_c(
            json["name"] ?? "",
            json["artist"] ?? "",
            json["album"] ?? "",
            json["duration"] ?? -1,
            json["listen_num"] ?? 0,
            json["created_time"] ?? 0,
            json["lasted_time"] ?? 0,
        );
    }

    static fromJsonStr(json:string):SongInfoEntity_c {
        return SongInfoEntity_c.fromJson(JSON.parse(json));
    }

    toJson(): Map<string, any>{
        return new Map<string, any>([
            ["name", this.name],
            ["artist", this.artist],
            ["album", this.album],
            ["duration", this.duration],
            ["listen_num", this.listen_num],
            ["created_time", this.created_time],
            ["lasted_time", this.lasted_time],
        ]);
    }

    copyWith(
      name: string | null = null,
      artist: string | null = null,
      album: string | null = null,
      duration:number | null = null,
      listen_num:number | null = null,
      created_time:number | null = null,
      lasted_time:number | null = null,
    ):SongInfoEntity_c {
      return new SongInfoEntity_c(
        name ?? this.name,
        artist ?? this.artist,
        album ?? this.album,
        duration ?? this.duration,
        listen_num ?? this.listen_num,
        created_time ?? this.created_time,
        lasted_time ?? this.lasted_time,
      );
    }

    toString(): string {
        return myMapStringify(this.toJson());
    }
}

export class SongAudioSrcInfo_c extends MySrcInfo_c {
    size:number = -1; // 文件大小
    duration:number = -1; // 时长, 单位：ms
    quality:MySongQuality_e = MySongQuality_e.Undefined; // 质量
  
    constructor(
      type:MySrcType_e = MySrcType_e.Undefined,
      size:number = -1,
      duration:number = -1,
      quality:MySongQuality_e = MySongQuality_e.Undefined,
    ) {
      super(type);
      this.size = size;
      this.duration = duration;
      this.quality = quality;
    }

    override oFromJson(json:Map<string, any>):boolean {
      const rebool = super.oFromJson(json);
      if(true == rebool) {
        this.size = json["size"] ?? -1;
        this.duration = json["duration"] ?? -1;
        this.quality = MySongQuality_c.intToQuality(json["quality"]) ?? MySongQuality_e.Undefined;
        return true;
      }
      return false;
    }

    toJson():Map<string, any> {
      let remap = super.toJson();
      remap.set("size", this.size);
      remap.set("duration", this.duration);
      remap.set("quality", MySongQuality_c.qualityToInt(this.quality));
      return remap;
    }

    override copyWith(
      type:MySrcType_e | null = null,
      size : number | null = null,
      duration : number | null = null,
      quality:MySongQuality_e | null = null,
    ):SongAudioSrcInfo_c {
      return new SongAudioSrcInfo_c(
        type ?? this.type,
        size ?? this.size,
        duration ?? this.duration,
        quality ?? this.quality,
      );
    }
}

export class Song_c{
    sid:number          = -1;
    type:number         = SongEntity_type_e.Undefine;
    info:SongInfoEntity_c = new SongInfoEntity_c();
    name:string         = "MyMusic";
    artist:string       = "Mimicry";
    icon:MySrc_c<MySrcInfo_c> = new MySrc_c<MySrcInfo_c>(new MySrcInfo_c());
    audio:Array<MySrc_c<SongAudioSrcInfo_c>> = []; // 资源文件
    lyric:MySrc_c<MySrcInfo_c> = new MySrc_c<MySrcInfo_c>(new MySrcInfo_c()); // 歌词
    script:MySrc_c<MySrcInfo_c> = new MySrc_c<MySrcInfo_c>(new MySrcInfo_c()); // 脚本
    
    constructor(
      sid:number = -1,
      name:string = "",
      artist:string = "",
      type:SongEntity_type_e = SongEntity_type_e.Undefine,
      info:SongInfoEntity_c|null = null,
      icon:MySrc_c<MySrcInfo_c> | null = null,
      audio:Array<MySrc_c<SongAudioSrcInfo_c>> | null = null,
      lyric:MySrc_c<MySrcInfo_c> | null = null,
      script:MySrc_c<MySrcInfo_c> | null = null,
    ) {
      this.sid = sid;
      this.name = name;
      this.artist = artist;
      this.type = type;
      this.icon = icon ?? new MySrc_c(new MySrcInfo_c()),
      this.audio = audio ?? [],
      this.lyric = lyric ?? new MySrc_c(new MySrcInfo_c()),
      this.script = script ?? new MySrc_c(new MySrcInfo_c()),
      this.info = info ??
         new SongInfoEntity_c(
            name,
            artist,
          );
    }

      // 随机生成sid，并且与传入in_list内所有song_c的sid不同
  static randSid(in_list:Array<Song_c> | null) :number {
    if (null != in_list) {
      for (let doRand = true; doRand;) {
        let randsid = Math.floor(Math.random() * 100000000);
        let i = in_list.length;
        for (; i-- > 0;) {
          if (randsid == in_list[i].sid) {
            break;
          }
        }
        if (-1 == i) {
          return randsid;
        }
      }
    } 
    return Math.floor(Math.random() * 100000000);
  }

  static fromJson(json:Map<string, any>) :Song_c {
    const audioStr:string = json["audio"];
    let audio = Array<MySrc_c<SongAudioSrcInfo_c>>();
    if (null != audioStr && audioStr.length > 0) {
      try {
        const audiolist:Array<string> = JSON.parse(json["audio"]);
        for (let i = 0, len = audiolist.length; i < len; ++i) {
          audio.push(MySrc_c.fromString<SongAudioSrcInfo_c>(audiolist[i], new SongAudioSrcInfo_c()));
        }
      } catch (e) {
        MyLogger.severe(new MyLogItem("json 解析错误",
            [e, json["audio"]]));
      }
    }
    const resong = new Song_c(
      json["sid"] ?? -1,
      json["name"] ?? "",
      json["artist"] ?? "",
      json["type"] ?? SongEntity_type_e.Undefine,
      (null != json["info"])
          ? SongInfoEntity_c.fromJsonStr(json["info"])
          : null,
      (null != json["icon"]) ? MySrc_c.fromString(json["icon"],new MySrcInfo_c()) : null,
      audio,
      (null != json["lyric"]) ? MySrc_c.fromString(json["lyric"],new MySrcInfo_c()) : null,
                (null != json["script"]) ? MySrc_c.fromString(json["script"], new MySrcInfo_c()) : null,
    );
    return resong;
  }

  static fromJsonStr(json:string):Song_c {
    try {
      return Song_c.fromJson(JSON.parse(json));
    } catch (e) {
      MyLogger.severe(new MyLogItem(
         "json 解析错误",
        [e, json],
      ));
      return new Song_c();
    }
  }

  static listFromJsonStr(data:string):Array<Song_c> | null {
    try {
      let list:Array<any> = JSON.parse(data);
      let relist = Array<Song_c>();
      for (let i = 0; i < list.length; ++i) {
        relist.push(Song_c.fromJson(list[i]));
      }
      return relist;
    } catch (e) {
      MyLogger.severe(new MyLogItem(
        "json 解析错误",
        [e, data],
      ));
      return null;
    }
  }

  audioToJson():Array<string> {
    let audioStr = Array<string>();
    for (let i = 0, len = this.audio.length; i < len; ++i) {
      audioStr.push(this.audio[i].toString());
    }
    return audioStr;
  }

  toJson():Map<string, any> {
    let remap = new Map<string, any>([
      ["sid", this.sid],
      ["name", this.name],
      ["artist", this.artist],
      ["type", this.type],
      ["info", this.info.toString()],
      ["icon", this.icon.toString()],
      ["audio", JSON.stringify(this.audioToJson())],
      ["lyric", this.lyric.toString()],
      ["script", this.script.toString()],
    ]);
    return remap;
  }

  toString():string {
    return myMapStringify(this.toJson());
  }

  isAudioSrcEmpty():boolean {
    if (this.audio.length == 0) {
      return true;
    }
    for (let i = 0, len = this.audio.length; i < len; ++i) {
      if (false == this.audio[i].isSrcEmpty()) {
        return false;
      }
    }
    return true;
  }

  getAudioSrc(
    index:number = 0,
  ):MySrc_c<SongAudioSrcInfo_c> {
    if (index < 0 || index >= this.audio.length) {
      return new MySrc_c(new SongAudioSrcInfo_c());
    }
    return this.audio[index];
  }

   tryGetAudioSrc(
    index:number = 0,
  ):MySrc_c<SongAudioSrcInfo_c> | null {
    if (index < 0 || index >= this.audio.length) {
      return null;
    }
    return this.audio[index];
  }

  getAudioSrcType(
    index:number = 0,
  ) :MySrcType_e{
    if (index < 0 || index >= this.audio.length) {
      return MySrcType_e.Undefined;
    }
    return this.audio[index].info.type;
  }

  copyWith(
    sid:number | null = null,
    name:string | null = null,
    artist:string | null = null,
    type:number | null = null,
    info:SongInfoEntity_c | null = null,
    icon:MySrc_c<MySrcInfo_c> | null = null,
    audio:Array<MySrc_c<SongAudioSrcInfo_c>> | null = null,
    lyric:MySrc_c<MySrcInfo_c> | null = null,
    script:MySrc_c<MySrcInfo_c> | null = null,
  ) : Song_c {
    let newAudio = audio;
    if(null == newAudio) {
      newAudio = new Array<MySrc_c<SongAudioSrcInfo_c>>();
      this.audio.forEach((value, index, array) => {
        newAudio?.push(value.copyWith());
      });
    }

    return new Song_c(
      sid ?? this.sid,
      name ?? this.name,
      artist ?? this.artist,
      type ?? this.type,
      info ?? this.info.copyWith(),
      icon ?? this.icon.copyWith(),
      newAudio,
      lyric ?? this.lyric.copyWith(),
      script ?? this.script.copyWith(),
    );
  }

};

/// 歌曲资源缓存记录
class SongSrcCacheValue_c {
  deadline:number;
  src:Array<MySrc_c<SongAudioSrcInfo_c>> | null;

  constructor(
    src : Array<MySrc_c<SongAudioSrcInfo_c>> | null,
    deadline:number = 0,
  ) {
    this.src = src;
    this.deadline = deadline;
  }
}

export const Song_store = defineStore(StoreNames.playList.Song, {
    state() {
        return {
            url_s:      Url_store(),
            src_s:      Src_store(),

            songSrcCache:new Map<string, SongSrcCacheValue_c>(),

            //已选择的歌曲
            selectSong: new Song_c(-1, "Mimicry", "Music"),
            isable:{    //功能启用
                songThumb_wave:true,
                songThumb_rotate:true,
            },

            /* 解析b站音频的方式
            *   1：兼容
            *   2：极速
            */
            toBili_transitionType:2,
            regex:{
                name:       /^.{1,1000}$/,
                artist:     /^.{1,1000}$/,
                src:        /^.{0,2000}$/,
            },

            default_src: {
                img:Src_store().img.default_song
            },
        }
    },
    getters:{
        //当前选择的歌曲是否可读取
        isSongAvailable:function(state):boolean {
            return (state.selectSong ? true : false);
        },
        isable_songThumb_wave:function(state) {
            return (state.isable.songThumb_wave);
        },
        isable_songThumb_rotate:function(state) {
            return (state.isable.songThumb_rotate);
        },
        getSelectSong:function(state):Song_c {
          return state.selectSong;
      },
    },
    actions:{
        isFormat_name:function(in_str:string) {
            return this.regex.name.test(in_str);
        },
        setSelectSong:async function(in_song:Song_c) {
          const audio_s = Audio_store();
            this.selectSong = in_song.copyWith();
            // TODO: 禁用播放
            Global_store().tip("目前暂时禁用播放功能");
            return true;
            const rebool = await audio_s.resetSource(this.selectSong.audio, null);
            if(true == rebool) {
              audio_s.doPlay(
                //errFun
                function(err:Object) {
                    Global_store().tip("该歌曲无法播放，即将播放下一首...");
                    PlayList_store().next_click(false);
            });
            }
            return rebool;
        },
        set_isable_songThumb_wave:function(in_bool:boolean) {
            this.isable.songThumb_wave = in_bool;
        },
        set_isable_songThumb_rotate:function(in_bool:boolean) {
            this.isable.songThumb_rotate = in_bool;
        },
        //把歌曲中的的资源标记转换为链接
        audio_toUrl: async function (audioSrc: MySrc_c<SongAudioSrcInfo_c>,
          doErrTip: boolean = true,
        ): Promise<Array<MySrc_c<SongAudioSrcInfo_c>> | null> {
          const key = audioSrc.toString();
          const nowTime = Math.floor(Date.now() / 1000);
          // 尝试读取缓存
          const cache = this.songSrcCache[key];
          if (null != cache && (cache.deadline - nowTime) > 60) {
            return cache.src;
          }
          // 转代理链接
          if (MySrcType_e.Bili == audioSrc.info.type) {
            // bili资源
            if (audioSrc.src.length > 0) {
              // 获取 bili 视频的 cid
              const resp_bili_pagelist = await this.url_s.getBili_pagelist(
                audioSrc.src,
                doErrTip
              );
              if (null != resp_bili_pagelist &&
                200 == resp_bili_pagelist.status &&
                null != resp_bili_pagelist.data["data"]) {
                // 获取 bili 视频的音频链接
                const cid: number = resp_bili_pagelist.data["data"][0]["cid"];
                const resp_bili_playurl = await this.url_s.getBili_playurl(
                  audioSrc.src,
                  cid,
                  doErrTip,
                );
                if (null != resp_bili_playurl &&
                  200 == resp_bili_playurl.status &&
                  null != resp_bili_playurl.data["data"]) {
                  const reData = resp_bili_playurl.data["data"];
                  // 获取视频长度, 单位：秒
                  const retimeLength: number | null = reData["timelength"];
                  let audioDuration: number | null = retimeLength; // 此时的单位为ms
                  if (null != audioDuration) {
                    audioDuration /= 1000; // 转换单位为秒
                  } else {
                    audioDuration = reData["dash"]["duration"];
                  }
                  // 截取音频链接
                  //                                     size (文件大小，单位：bit)
                  // bandwidth (建议带宽，单位：bit/s) = ------------------------------
                  //                                     duration （视频时长，单位：秒）
                  // [
                  //    {
                  //        "bandwidth": int    // 建议带宽
                  //        "baseUrl": String   // 源文件链接
                  //    }
                  // ]
                  let audioList: Array<any> = reData["dash"]["audio"];
                  // 截取截至可用时间戳
                  var url_audio = audioList[0]["baseUrl"];
                  let deadline = parseInt(this.url_s.getUrlParam("deadline", (url_audio.split('?'))[1]));
                  let srclist: Array<MySrc_c<SongAudioSrcInfo_c>> = [];
                  for (let i = audioList.length; i-- > 0;) {
                    const itemData = audioList[i];
                    const itemBandwidth: number | null = itemData["bandwidth"];
                    const itemSize: number = (null != itemBandwidth && null != audioDuration)
                      ? Math.floor(itemBandwidth / audioDuration)
                      : -1;
                    const itemDuration: number = (null != audioDuration)
                      ? Math.floor(audioDuration * 1000)
                      : -1;
                    const item = new MySrc_c<SongAudioSrcInfo_c>(
                      new SongAudioSrcInfo_c(
                        MySrcType_e.Bili,
                        itemSize,
                        itemDuration,
                        MySongQuality_c.getQuality(
                          (null != itemBandwidth)
                            ? (itemBandwidth / 1024)
                            : 0),
                      ),
                      this.url_s.proxy.bili.src + "?url=" + url_audio,
                    );
                    srclist.push(item);
                  }
                  this.songSrcCache[key] =
                    new SongSrcCacheValue_c(srclist, deadline);
                  return srclist;
                }
              }
            }
            return null;
          }
          return [
            audioSrc
          ];
        },
    }
})