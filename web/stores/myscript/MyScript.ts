import { defineStore } from "pinia"

import { AudioLyric_store } from "../lyric/Lyric";
import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";
import { Url_store } from "../Url";

export enum MyScript_state_e {
    Undefine    = -1,
    Normal      = 200,
    Locked      = 400,	//封禁
    Deleted     = 410,	//已删除
    Error       = 500	// 错误
}
export enum MyScript_access_e {
    Undefine	= -1,
    Private		= 0,
    Public		= 200
}
export class MyScriptItem_c {
    protected time:number      = -1;
    protected timeStr:string   = "";
    code:string                = "";
    constructor(in_time:number = -1, in_code:string = "") {
        this.time = in_time;
        this.timeStr = AudioLyric_store().numtimeToLrctime(this.time);
        this.code = in_code;
    };
    get_codeStr() {
        return this.code;
    }
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

};
export class MyScript_c {
    msid:number             = -1;
    uid:number              = -1;
    state                   = MyScript_state_e.Undefine;
    access                  = MyScript_access_e.Undefine;
    name:string             = "";
    depict:string           = "";
    love:number             = 0;
    src                     = new Array<MyScriptItem_c>();
    srcAvailable:boolean    = false;
    islove:boolean          = false;

};

export const MyScript_store = defineStore(StoreNames.myscript.MyScript, {
    state() {
        return {
            global_s:   Global_store(),
            url_s:      Url_store(),

        }
    },
    getters:{},
    actions:{

    }
})