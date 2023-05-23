import { defineStore } from "pinia"
import { MyLogger, MyLogItem } from "../../util/GlobalUtil";

import { StoreNames } from "../StoreNames";
import { MyErrTipStr_c, MyNetStateCode_e, Url_store } from "../Url";

export class MyHomeTipEntity_c {
    id:number = -1;
    uid :number = -1;
    access :number = -1;
    state :number = -1;
    title:string = "";
    depict:string = "";
    content:string = "";
    tags:Array<string> = [];
    allowCache:boolean = false;
    created_time:number = -1;
    lasted_time :number = -1;

    constructor(
        id:number = -1,
        uid :number = -1,
        access :number = -1,
        state :number = -1,
        title:string = "",
        depict:string = "",
        content:string = "",
        tags:Array<string> = [],
        allowCache:boolean = false,
        created_time:number = -1,
        lasted_time :number = -1,
    ) {
        this.id = id;
        this.uid = uid;
        this.access = access;
        this.state = state;
        this.title = title;
        this.depict = depict;
        this.content = content;
        this.tags = tags;
        this.allowCache = allowCache;
        this.created_time = created_time;
        this.lasted_time = lasted_time;
    }

    static fromJson(json: Map<string, any>): MyHomeTipEntity_c {
        return new MyHomeTipEntity_c(
            json["id"] ?? 1,
            json["uid"] ?? 1,
            json["access"] ?? 1,
            json["state"] ?? 1,
            json["title"] ?? "",
            json["depict"] ?? "",
            json["content"] ?? "",
            json["tags"] ?? [],
            json["allowCache"] ?? false,
            json["created_time"] ?? 1,
            json["lasted_time"] ?? 1,
        );
    }

    static fromJsonStr(json: string): MyHomeTipEntity_c {
        try {
            return MyHomeTipEntity_c.fromJson(JSON.parse(json));
        } catch (e) {
            MyLogger.severe(new MyLogItem(
                "Json 解析失败",
                [e, json],
            ));
        }
        return new MyHomeTipEntity_c();
    }
}


export class Enable_ListDetails_c {
    array = {
        edit:   true,
        add:    true,       //创建
        order:  true,        //排序
        delete: true,        //移除
        focus:  true,        //定位
    };
    item = {
        edit:       true,      //编辑
        interact:   true,      //互动
    };
};


export const GlobalComp_store = defineStore(StoreNames.global.GlobalComp, {
    state() {
        return {
            refNum:{
                CheckboxRect:0,
            },
            homeTipData : new Array<MyHomeTipEntity_c>(),
        }
    },
    getters:{},
    actions:{
        load_homeTip_byids:async function(idarr: Array<number>, doErrTip:boolean = true) : Promise<Array<MyHomeTipEntity_c> | null> {
            const url_s = Url_store();
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少信息ID"],
                [MyNetStateCode_e.ValueError, "获取信息失败"],
            ]));
            let url = url_s.recommend.homeTip.getInfo + "?id=" + idarr[0];
            for (let i = 1, len = idarr.length; i < len; ++i) {
                if(idarr[i] >= 0) {
                    url = url + "&id=" + idarr[i];
                }
            }
            const myresp = await url_s.getServer_jwt(
                url, 
                {}, 
                doErrTip,
                errTipObj
            );
            if(myresp.isSuccess(true)) {
                let relist = Array<MyHomeTipEntity_c>();
                for(let i = 0; i < myresp.data.length; ++i) {
                    relist.push(MyHomeTipEntity_c.fromJson(myresp.data[i]));
                }
                //将结果排序成请求id的顺序
                for (let i = 0, j = 0; i < idarr.length && j < relist.length; ++i) {
                    let k = j;
                    for (; k < relist.length && relist[k].id != idarr[i]; ++k);
                    if (k != relist.length) {
                        let temp = relist[j];
                        relist[j] = relist[k];
                        relist[k] = temp;
                        ++j;
                    }
                }
                return relist;
            }
            return null;
        },
        load_homeTip_byTags:async function(tagarr: Array<string>, doErrTip: boolean = true) : Promise<Array<MyHomeTipEntity_c> | null> {
            const url_s = Url_store();
            let url = url_s.recommend.homeTip.getByTag + "?tags=" + tagarr[0];
            for (let i = 1, len = tagarr.length; i < len; ++i) {
                if(tagarr[i].length > 0) {
                    url = url + "&id=" + tagarr[i];
                }
            }
            const myresp = await url_s.getServer_jwt(
                url,
                {},
                doErrTip,
            );
            if(myresp.isSuccess(true)) {
                let list:Array<number> = [];
                for(let i = 0; i < myresp.data.length; ++i) {
                    let item = myresp.data[i];
                    if(item.id) {
                        list.push(item.id);
                    }
                }
                if(list.length > 0) {
                    return this.load_homeTip_byids(list, doErrTip);
                }
                return [];
            }
            return null;
        },
        load_homeTip_auto:async function(doErrTip:boolean = true) : Promise<Array<MyHomeTipEntity_c> | null> {
            const url_s = Url_store();
            const myresp = await url_s.getServer_jwt(
                url_s.recommend.homeTip.getAuto,
                {},
                doErrTip
            );
            if(myresp.isSuccess(true)) {
                return this.load_homeTip_byids(myresp.data, doErrTip);
            }
            return null;
        }
    }
})