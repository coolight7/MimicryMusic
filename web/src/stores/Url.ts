import { defineStore } from "pinia"
import { Global_store } from "./Global";
import { StoreNames } from "./StoreNames";

import axios, { AxiosResponse } from 'axios';
import { User_store } from "./user/User";
import { myMapStringify } from "../util/GlobalUtil";

//请求超时时间
axios.defaults.timeout = 16000;

/// mimicry请求状态码
export class MyNetStateCode_e {
    static Undefined: number = -1;
    static Continue: number = 1000; // 继续
    static ContinueCustom: number = 1777; // 继续，并附带自定义提示
    static OK: number = 2000; //成功
    static OKCustom: number = 2777; // 成功，并附带自定义提示
    static JumpCustom: number = 3777; // 跳转标记，并附带自定义提示
    static LoginStateError: number = 4000; //用户需要登录
    static PermissionError: number = 4001; //权限错误
    static ForbiddenError: number = 4003; //拒绝请求
    static NotFoundError: number = 4004; //请求资源无法找到
    static ValueHiatusError: number = 4010; //参数缺失
    static ValueError: number = 4011; //参数错误
    static DeletedError: number = 4012; //已被删除
    static RepearError: number = 4013; //重复动作
    static LockedError: number = 4014; //已被封禁
    static LimitError: number = 4015; // 违反限制
    static Toofast: number = 4016;		// 访问太快
    static TooMany: number = 4017;		// 访问次数太多
    static VerifyError: number = 4018;   // 验证不通过
    static FaildCustom: number = 4777; // 客户端错误，并附带自定义提示
    static Exception: number = 5000; // 服务器错误
    static ExceptionCustom: number = 5777; // 服务端错误，并附带自定义提示
    static NetWorkError: number = 6001;  // 网络状态错误
    static DioConnectTimeout: number = 7001; // 网络连接超时
    static DioSendTimeout: number = 7002; // 请求发生超时
    static DioReceiveTimeout: number = 7003; // 请求接收超时
    static DioResponse: number = 7004;
    static DioCancel: number = 7005;
    static DioOther: number = 7006;
}

/* 请求错误时返回值类型
*/
export class ErrValue_c {
    data: any;                   // res 或 err
    isErr: boolean = false;      // 是否真实请求错误
    constructor(in_data: any, in_isErr: boolean) {
        this.data = in_data;
        this.isErr = in_isErr;
    }
}

export class MyErrTipStr_c {
    static instance = new MyErrTipStr_c(true);

    errTip = new Map<number, string>();

    constructor(doInit: boolean = false) {
        if (doInit) {
            this.errTip.set(403, "请求被拒绝");
            this.errTip.set(404, "请求不存在");
            this.errTip.set(500, "服务错误");
            this.errTip.set(502, "服务暂时不可用");
            this.errTip.set(503, "服务正在维护中");
            this.errTip.set(MyNetStateCode_e.LoginStateError, "请登录账号");
            this.errTip.set(MyNetStateCode_e.PermissionError, "权限不足");
            this.errTip.set(MyNetStateCode_e.ForbiddenError, "请求被拒绝");
            this.errTip.set(MyNetStateCode_e.NotFoundError, "请求资源无法找到");
            this.errTip.set(MyNetStateCode_e.ValueHiatusError, "请求参数缺失");
            this.errTip.set(MyNetStateCode_e.ValueError, "请求参数错误");
            this.errTip.set(MyNetStateCode_e.DeletedError, "已被删除");
            this.errTip.set(MyNetStateCode_e.RepearError, "请勿重复操作");
            this.errTip.set(MyNetStateCode_e.LockedError, "已被封禁");
            this.errTip.set(MyNetStateCode_e.LimitError, "违反限制条件");
            this.errTip.set(MyNetStateCode_e.Toofast, "访问太频繁");
            this.errTip.set(MyNetStateCode_e.TooMany, "访问次数太多");
            this.errTip.set(MyNetStateCode_e.VerifyError, "验证失败");
            this.errTip.set(MyNetStateCode_e.Exception, "服务器错误");
        }
    }

    addAll(map: Map<number, string>): void {
        map.forEach((value, key, map) => {
            this.errTip.set(key, value);
        });
    }

    get(in_num: number) {
        return this.errTip.get(in_num);
    }

    getCustomTip(in_num: number, respTip: string | null): string | null {
        switch (in_num) {
            case MyNetStateCode_e.ContinueCustom:
            case MyNetStateCode_e.OKCustom:
            case MyNetStateCode_e.FaildCustom:
            case MyNetStateCode_e.ExceptionCustom:
                return respTip;
            default:
                return null;
        }
    }

    tryGet(in_num: number, respTip: string): string | undefined {
        const reStr = this.get(in_num) ??
            this.getCustomTip(in_num, respTip);
        if (null == reStr) {
            if (respTip.length > 0) {
                return respTip;
            }
            return this.errTip.get(MyNetStateCode_e.Undefined);
        }
        return reStr;
    }

    /// *  当in_num对应的tip不存在时
    /// *  尝试获取自定义提示
    /// *  否则使用undefined填充，
    /// *  若undefined对应的tip也不存在，则返回空字符串
    mustGet(in_num: number, respTip: string): string {
        return this.tryGet(in_num, respTip) ?? "";
    }

    static getInstance(): MyErrTipStr_c {
        return MyErrTipStr_c.instance;
    }

    static getErrTip(in_num: number | null, respTip: string | null, errTipObj: MyErrTipStr_c | null): string {
        let tip: string | undefined = undefined;
        if (null != in_num && null != respTip) {
            // 存在自定义提示
            tip = errTipObj?.tryGet(in_num, respTip);
        }
        // 兜底默认提示
        tip ??= MyErrTipStr_c.getInstance().mustGet(in_num ?? MyNetStateCode_e.Undefined, respTip ?? "");
        return tip;
    }

}

export class MyResponse_c {
    code: number = -1;
    data: any = null;
    tip: string = "";

    constructor(
        code: number = MyNetStateCode_e.Undefined,
        data: any = null,
        tip: string = "",
    ) {
        this.code = code;
        this.data = data;
        this.tip = tip;
    }

    /// 检查请求是否成功
    isSuccess(
        checkDataNotNull: boolean = false, // 检查data是否不为null
        checkDataNotEmpty: boolean = false, // 检查data是否不为null且不为空
    ): boolean {
        return ((MyNetStateCode_e.OK == this.code || MyNetStateCode_e.OKCustom == this.code) &&
            // 只要 [checkDataNotNull] 和 [checkDataNotEmpty] 有一个为 true，则需要检查 null != data
            ((false == checkDataNotEmpty && false == checkDataNotNull) ||
                null != this.data) &&
            (false == checkDataNotEmpty || (!this.data.length || this.data.length > 0)));
    }

    static fromJson(json: Map<string, any>): MyResponse_c {
        return new MyResponse_c(
            json["code"] ?? MyNetStateCode_e.Undefined,
            json["data"] ?? {},
            json["tip"] ?? "",
        );
    }

    static fromJsonStr(json: string): MyResponse_c {
        try {
            return MyResponse_c.fromJson(JSON.parse(json));
        } catch (e) {
            // 解析错误
            return new MyResponse_c(
                MyNetStateCode_e.Undefined,
            );
        }
    }

    static fromResp(resp: AxiosResponse<any, any> | null): MyResponse_c {
        if (null != resp && resp.status == 200) {
            return MyResponse_c.fromJson(resp.data);
        }
        return new MyResponse_c(MyNetStateCode_e.Undefined);
    }
}

class MyClientInfo_c {
    name: string = "MimicryMusic";
    version: number = Global_store().version;
    system_type: string = "web";
    device_info: string = navigator.userAgent;

    toJsonStr(): string {
        const remap = new Map<string, any>([
            ["name", this.name],
            ["version", this.version],
            ["system_type", this.system_type],
            ["device_info", this.device_info],
        ]);
        return myMapStringify(remap);
    }
}

function getClientInfo(): MyClientInfo_c {
    return new MyClientInfo_c();
}

export const Url_store = defineStore(StoreNames.Url, {
    state() {
        return {
            NAME_jwt_user: "JwtUser",
            NAME_clientInfo: "ClientInfo",
            jwt_user: "",        //jwt_user
            //域名
            domain: {
                url: (import.meta.env.DEV) ? "http:127.0.0.1:5173" : "https://music.mimicry.cool",
                enable: false
            },
            //链接前缀
            prefix: {
                enable: false,
                url: {
                    cmusicApi: "/cmusic",
                }
            },
            proxy: {
                bili: {
                    src: "/api/proxy/bili/src",
                    pagelist: "/api/proxy/bili/pagelist",
                    playurl: "/api/proxy/bili/playurl",
                    view: "/api/proxy/bili/view"
                },
                cos: {
                    uploadGeturl: "/api/proxy/cos/upload/geturl",
                    hasfile: "/api/proxy/cos/hasfile",
                    downGeturl: "/api/proxy/cos/down/geturl",
                },
            },

            user: {    //用户
                login: {
                    signUp: "/api/user/login/signup",        //注册
                    signIn: "/api/user/login/signin",        //登录
                    getPasswdSolt: "/api/user/login/passwd_solt",     //获取密码盐
                    autoSignIn: "/api/user/login/auto_signin",
                    setAutoSignIn: "/api/user/login/set/auto_signin",
                    signOut: "/api/user/login/signOut",       //退出登录
                },
                getInfo: "/api/user/get/info",               //获取用户信息
                setInfo: "/api/user/set/info",
                bycids: "/api/user/get/open_info/byuids",    //获取用户列表公开信息
                getBindEmailCode: "/api/user/get/bind_emailcode",
                setEmail: "/api/user/set/email",
                setPasswdByEmail: "/api/user/set/passwd/byemail",
                setPasswd: "/api/user/set/passwd",
                getRetrieveEmailCode:"/api/user/get/retrieve_emailcode",
            },
            search: {   //搜索
                list: "/api/search/list",
                song: "/api/search/song",
                user: "/api/search/user",
                lyric: "/api/search/lyric"
            },
            playList: {  //播放列表
                get: {
                    bycplayids: "/api/playlist/get/list/bypids",
                    song: "/api/playlist/get/list/songs",
                    user: {
                        create: "/api/playlist/get/create/list",
                        star: "/api/playlist/get/star/list",
                        favory: "/api/playlist/get/favory/pid",
                    }
                },
                set: {
                    song: "/api/playlist/set/list/songs",
                    list: "/api/playlist/set/list"
                },
                remove: {
                    create: "/api/playlist/remove/create/list",
                    star: "/api/playlist/remove/star/list"
                },
                add: {
                    like: "/api/playlist/add/like/list",
                    star: "/api/playlist/add/star/list",
                    list: "/api/playlist/add/create/list"
                },
                order: {
                    list: {
                        create: "/api/playlist/order/create/list",
                        star: "/api/playlist/order/star/list"
                    },
                    song: ""
                }
            },
            lyric: {
                add: {
                    create: "/api/lyric/add/create",
                    like: "/api/lyric/add/like"
                },
                remove: {
                    create: "/api/lyric/remove/create"
                },
                set: {
                    info: "/api/lyric/set/create/info",
                    src: "/api/lyric/set/create/src"
                },
                get: {
                    create: "/api/lyric/get/create",
                    src: "/api/lyric/get/src",
                    info: "/api/lyric/get/info/bylrcids",
                    like: "/api/lyric/get/like"
                },
                order: {
                    create: "/api/lyric/order/create"
                }
            },
            src: {   //通用资源文件
                hasFile: "/api/src/hasfile",
                upload: "/api/src/upload",
                get: "/api/src/get",
                download: "/api/src/download"
            },
            recommend: {
                homeTip: {
                    getInfo: "/api/recommend/get/hometip/info",
                    getByTag: "/api/recommend/get/hometip/bytags",
                    getAuto: "/api/recommend/get/hometip/auto",
                }
            },
            bili: {  //b站
                toBili: "https://www.bilibili.com/video/"
            },
            ip: {
                getIp: "http://api.ip.sb/ip",
                getInfo: "https://ip.help.bj.cn/"
            },
            paramName: {
                playlist: {
                    selectLists: "slists",   //my star history
                    selectList: "slist",    //cplayid
                    selectsong: "ssong",    //sid
                    selectsongIndex: "ssongi", //歌单中歌曲下标，0开始
                    playModel: "pmodel",   //循环播放方式
                }
            }
        }
    },
    getters: {},
    actions: {
        /*发送post请求函数
        * in_url:请求链接
        * in_data:发送的数据
        */
        postServer: async function (
            in_url: string,
            in_data: any,
            doErrTip: boolean = true,
            errTipObj: MyErrTipStr_c | null = null,
        ): Promise<AxiosResponse<any, any> | null> {
            if (this.prefix.enable) {
                in_url = this.prefix.url.cmusicApi + in_url;
            }
            if (this.domain.enable) {
                in_url = this.domain.url + in_url;
            }
            const resp = await axios({
                method: 'POST',
                url: in_url,
                data: in_data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                transformRequest: function (obj) {
                    let str = new Array<string>();
                    for (let p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                }
            });
            if (resp.status == 200) {     //成功
                return resp;
            }
            //失败提示
            if (doErrTip) {
                let tip = MyErrTipStr_c.getErrTip(resp?.status ?? MyNetStateCode_e.Undefined, "", errTipObj);
                if (tip) {
                    Global_store().tip(tip);
                }
            }
            return null;
        },
        getServer: async function (
            in_url: string,
            in_params: any,
            doErrTip: boolean = true,
            errTipObj: MyErrTipStr_c | null = null,
        ): Promise<AxiosResponse<any, any> | null> {
            let resp: AxiosResponse<any, any> | null = null;
            try {
                resp = await axios({
                    method: "GET",
                    url: in_url,
                    params: in_params,
                    headers: {}
                });
            } catch (e) {
                console.log(e);
            }
            if (resp?.status == 200) {     //成功
                return resp;
            }
            //失败提示
            if (doErrTip) {
                let tip = MyErrTipStr_c.getErrTip(resp?.status ?? MyNetStateCode_e.Undefined, "", errTipObj);
                if (tip) {
                    Global_store().tip(tip);
                }
            }
            return null;
        },
        getProxyServer: function (
            in_url: string,
            doErrTip: boolean = true,
            errTipObj: MyErrTipStr_c | null = null,
        ): Promise<AxiosResponse<any, any> | null> {
            return this.getServer(this.proxy.bili.src + "?url=" + in_url,
                {},
                doErrTip,
                errTipObj,
            );
        },
        postServer_jwt: async function (
            in_url: string,
            in_params: any,
            in_data: any,
            errTipObj: MyErrTipStr_c | null = null,
            doErrTip: boolean = true,
            contentType: string = 'application/x-www-form-urlencoded',
            headers: Map<string, string> | null = null,
        ): Promise<MyResponse_c> {
            if (this.prefix.enable) {
                in_url = this.prefix.url.cmusicApi + in_url;
            }
            if (this.domain.enable) {
                in_url = this.domain.url + in_url;
            }
            let myHeader = {};
            headers?.forEach((value, key, map) => {
                myHeader[key] = value;
            });
            myHeader['Content-Type'] = contentType;
            myHeader[this.NAME_jwt_user] = this.jwt_user;
            myHeader[this.NAME_clientInfo] = getClientInfo().toJsonStr();
            const transform = (contentType == 'application/x-www-form-urlencoded')
                ? function (obj: any): string {
                    let str = new Array<String>();
                    for (let p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                }
                : undefined;
            try {
                const resp = await axios(in_url,
                    {
                        method: 'POST',
                        params: in_params,
                        data: in_data,
                        headers: myHeader,
                        transformRequest: transform,
                    });
                const myresp = MyResponse_c.fromResp(resp);
                //成功
                if (myresp.code == MyNetStateCode_e.OK) {
                    return myresp;
                }
                //需要刷新登录状态
                if (myresp.code == MyNetStateCode_e.LoginStateError) {
                    const rebool = await User_store().flushSignIn();
                    if (true == rebool) {
                        return this.postServer_jwt(in_url, in_params, in_data, errTipObj, doErrTip, contentType, headers);
                    }
                }
                //失败提示
                if (doErrTip) {
                    let tip = MyErrTipStr_c.getErrTip(myresp.code, myresp.tip, errTipObj);
                    if (tip) {
                        Global_store().tip(tip);
                    }
                }
                return myresp;
            } catch (e) {
                console.log(e)
                return new MyResponse_c();
            }
        },
        getServer_jwt: async function (
            in_url: string,
            in_params: any,
            doErrTip: boolean = true,
            errTipObj: MyErrTipStr_c | null = null,
            headers: Map<string, string> | null = null,
        ): Promise<MyResponse_c> {
            let myHeader = {};
            headers?.forEach((value, key, map) => {
                myHeader[key] = value;
            });
            myHeader[this.NAME_jwt_user] = this.jwt_user;
            myHeader[this.NAME_clientInfo] = getClientInfo().toJsonStr();
            try {
                const resp = await axios(in_url,
                    {
                        method: "GET",
                        params: in_params,
                        headers: myHeader
                    });
                const myresp = MyResponse_c.fromResp(resp);
                if (myresp.code == MyNetStateCode_e.OK) {     //成功
                    return myresp;
                }
                if (myresp.code == MyNetStateCode_e.LoginStateError) {        //需要刷新登录状态
                    const rebool = await User_store().flushSignIn();
                    if (true == rebool) {
                        return this.getServer_jwt(in_url, in_params, doErrTip, errTipObj, headers);
                    }
                }
                if (doErrTip) {
                    let tip = MyErrTipStr_c.getErrTip(myresp.code, myresp.tip, errTipObj);
                    if (tip) {
                        Global_store().tip(tip);
                    }
                }
                return myresp;
            } catch(e) {
                console.log(e)
                return new MyResponse_c();
            }
        },
        postServer_json_jwt: function (
            in_url: string,
            in_params: any,
            in_data: any,
            doErrTip: boolean = true,
            errTipObj: MyErrTipStr_c | null = null,
            headers: Map<string, string> | null = null,
        ): Promise<MyResponse_c> {
            if (this.prefix.enable) {
                in_url = this.prefix.url.cmusicApi + in_url;
            }
            if (this.domain.enable) {
                in_url = this.domain.url + in_url;
            }
            return this.postServer_jwt(
                in_url,
                in_params,
                in_data,
                errTipObj,
                doErrTip,
                'application/json',
                headers,
            );
        },
        postServer_binary_jwt: async function (
            in_url: string,
            in_params: any,
            in_data: any,
            in_content_type: string | null,
            doErrTip: boolean = true,
            errTipObj: MyErrTipStr_c | null = null,
            headers: Map<string, string> | null = null,
        ): Promise<MyResponse_c> {
            if (this.prefix.enable) {
                in_url = this.prefix.url.cmusicApi + in_url;
            }
            if (this.domain.enable) {
                in_url = this.domain.url + in_url;
            }
            return this.postServer_jwt(
                in_url,
                in_params,
                in_data,
                errTipObj,
                doErrTip,
                in_content_type ?? "application/octet-stream",
                headers,
            );
        },
        get_myIpInfo: function (doErrTip: boolean = true) {
            let _this = this;
            return new Promise((resolve, reject) => {
                const succFun = (res: any) => {
                    let resData = res.data.data[0];
                    let myIpInfo = {
                        ip: resData.ip,
                        nation: resData.nation,      //国家
                        province: resData.province,    //省
                        city: resData.city,        //市
                        district: resData.district     //县/区
                    }
                    resolve(myIpInfo);
                }
                _this.getServer(this.ip.getInfo,
                    {},
                    doErrTip).then((res: any) => {
                        succFun(res);
                    }).catch((err: ErrValue_c) => {
                        if (false == err.isErr) {
                            succFun(err.data);
                        } else {
                            reject(err);
                        }
                    })
            });
        },
        getBili_pagelist: function (in_bvid: string, doErrTip: boolean = true): Promise<AxiosResponse<any, any> | null> {
            let url: string = this.proxy.bili.pagelist;
            return this.getServer(url,
                {
                    "bvid": in_bvid
                },
                doErrTip);
        },
        getBili_playurl: function (
            in_bvid: string,
            in_cid: number,
            doErrTip: boolean = true
        ): Promise<AxiosResponse<any, any> | null> {
            let url = this.proxy.bili.playurl;
            return this.getServer(url,
                {
                    "bvid": in_bvid,
                    "cid": in_cid,
                    "fnval": 80
                },
                doErrTip
            );
        },
        getParam: function (name: string): string {
            return this.getUrlParam(name, window.location.search);
        },
        getUrlParam: function (name: string, urlParams: string): string {
            let p = urlParams.split('?')[1];
            let params = new URLSearchParams(p);
            return params.get(name) ?? "";
        },
        putServer_binary: async function (
            in_url: string,
            in_params: any,
            in_data: any,
            in_content_type: string | null,
            headers: Map<string, string> = new Map<string, string>(),
            sendTimeout: number = 60 * 1000,
            doErrTip: boolean = true,
        ): Promise<AxiosResponse<any, any> | null> {
            let myHeader = {};
            headers.forEach((value, key, map) => {
                myHeader[key] = value;
            });
            myHeader['Content-Type'] = in_content_type ?? "application/octet-stream";
            myHeader[this.NAME_jwt_user] = this.jwt_user;
            myHeader[this.NAME_clientInfo] = getClientInfo().toJsonStr();
            let resp: AxiosResponse<any, any> | null = null;
            try {
                resp = await axios({
                    method: 'PUT',
                    url: in_url,
                    params: in_params,
                    data: in_data,
                    headers: myHeader,
                    timeout: sendTimeout,
                    transformRequest: (in_content_type == 'application/x-www-form-urlencoded') ? (function (obj) {
                        let str = new Array<string>();
                        for (let p in obj) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                        return str.join("&");
                    }) : undefined
                });
                if ((resp!.status / 200) == 1) {     //成功
                    return resp;
                }
                //失败提示
                if (doErrTip) {
                    let tip = MyErrTipStr_c.getErrTip(resp?.status ?? MyNetStateCode_e.Undefined, "", null);
                    if (tip) {
                        Global_store().tip(tip);
                    }
                }
            } catch (e) {
                console.log(e);
                //失败提示
                if (doErrTip) {
                    Global_store().tip("请求失败");
                }
            }
            return null;
        },
    }
})