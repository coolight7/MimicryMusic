import { defineStore } from "pinia"

import sha512 from "crypto-js/sha512";

import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames"
import { ErrValue_c, Url_store, MyResponse_c, MyErrTipStr_c, MyNetStateCode_e } from "../Url"

import { Src_store } from "../Src"
import { MySrcInfo_c, MySrc_c } from "../../util/MySrc";
import { MyLogger, MyLogItem } from "../../util/GlobalUtil";

//性别枚举
export enum User_sex_e {
    Undefine = -1,
    boy = 1,
    girl = 2
};
//用户账户状态枚举
export enum User_state_e {
    Undefine = -1,
    Normal = 200,	//正常
    Locked = 400,	//封禁
    Deleted = 410,	//已删除
    Error = 500   // 错误
};
export enum User_passwd_alg_e {
    Undefine = -1,
    Alg_NO = 0,
    Alg_SHA1 = 1,
    Alg_MD5 = 5,
    Alg_SHA256 = 25,
    Alg_SHA384 = 38,
    Alg_SHA512 = 51
};

export class UserData_c {
    uid: number = -1;
    name: string = "游客";
    passwd: string = "";
    state: number = User_state_e.Undefine;
    usid: number = -1;
    phone: string = "";
    email:string = "";
    created_time: number = -1;
    icon: MySrc_c<MySrcInfo_c> = new MySrc_c<MySrcInfo_c>(new MySrcInfo_c());
    motto: string = "";
    sex: number = User_sex_e.Undefine;
    birthday: number = -1;
    level: number = 0;
    experience: number = -1;
    listen_len: number = 0;
    createPlayList_num: number = 0;
    starPlayList_num: number = 0;
    createSongNum: number = 0;
    createLyricNum: number = 0;

    constructor(
        uid: number = -1,
        name: string = "",
        passwd: string = "",
        state: number = User_state_e.Undefine,
        usid: number = -1,
        phone: string = "",
        email:string = "",
        created_time: number = -1,
        iconSrc: MySrc_c<MySrcInfo_c> | null = null,
        iconStr: string = "",
        motto: string = "",
        sex: User_sex_e = User_sex_e.Undefine,
        birthday: number = -1,
        level: number = 0,
        experience: number = 0,
        listen_len: number = 0,
        createPlayList_num: number = 0,
        starPlayList_num: number = 0,
        createSongNum: number = 0,
        createLyricNum: number = 0,
    ) {
        this.uid = uid;
        this.name = name;
        this.passwd = passwd;
        this.state = state;
        this.usid = usid;
        this.phone = phone;
        this.email = email;
        this.created_time = created_time;
        this.icon = iconSrc ?? MySrc_c.fromString(iconStr, new MySrcInfo_c());
        this.motto = motto;
        this.sex = sex;
        this.birthday = birthday;
        this.level = level;
        this.experience = experience;
        this.listen_len = listen_len;
        this.createPlayList_num = createPlayList_num;
        this.starPlayList_num = starPlayList_num;
        this.createSongNum = createSongNum;
        this.createLyricNum = createLyricNum;
    }

    static fromJson(json: Map<string, any>): UserData_c {
        return new UserData_c(
            json["uid"] ?? -1,
            json["name"] ?? "",
            json["passwd"] ?? "",
            json["state"] ?? User_state_e.Undefine,
            json["usid"] ?? -1,
            json["phone"] ?? "",
            json["email"] ?? "",
            json["created_time"] ?? -1,
            null,
            json["icon"] ?? "",
            json["motto"] ?? "",
            json["sex"] ?? User_sex_e.Undefine,
            json["birthday"] ?? -1,
            json["level"] ?? 0,
            json["experience"] ?? 0,
            json["listen_len"] ?? 0,
            json["createPlayList_num"] ?? 0,
            json["starPlayList_num"] ?? 0,
            json["createSongNum"] ?? 0,
            json["createLyricNum"] ?? 0,
        );
    }

    static fromJsonStr(json: string): UserData_c {
        try {
            return UserData_c.fromJson(JSON.parse(json));
        } catch (e) {
            MyLogger.severe(new MyLogItem(
                "json 解析错误",
                [e, json],
            ));
            return new UserData_c();
        }
    }
};


export const User_store = defineStore(StoreNames.user.User, {
    state() {
        return {
            url_s: Url_store(),
            src_s: Src_store(),
            localStorageNames:{
                jwt: "JwtUser",
                uid: "Uid",
                userName: "UserName",
            },

            //控制显示
            isShow: {
                bar: true,
                detail: true,
                detailType: false,   //窗口显示类型
                loginType: true,     //登录/注册显示类型
            },
            userdata: new UserData_c(),
            isLoginState: false,
            user_passwd_last: "",
            ipInfo: undefined,
            regex: {
                uid: /^\d{1,10}$/,
                name: /^(?!\d+$)([^\s\'\"\`\\\@]){1,20}$/,
                /// uid / 用户名 / 邮箱
                loginName: /(^\d{1,10}$)|(^(?!\d+$)([^\s\'\"\`\\\@]){1,20}$)|(^.+\@.+\..+$)/,
                passwd: /^[0-9a-zA-Z_.]{8,20}$/,
                email: /^.+\@.+\..+$/,
                emailcode: /^\d{6}$/
            },
            default_src: {
                img: Src_store().img.default_user
            }
        }
    },
    getters: {
        //判断是否显示登录框
        isShowLogin: function (state) {
            if (state.userdata.uid < 0) {
                return false;
            } else {
                return true;
            }
        },
        getUserCid: function (state) {
            return state.userdata.uid;
        },
        isLogin: function (state) {
            return state.isLoginState;
        },
    },
    actions: {
        //转换显示用户信息/登录
        detailType_click: function (in_type: boolean) {
            if (null != in_type) {
                this.isShow.detailType = in_type;
            } else {
                this.isShow.detailType = !(this.isShow.detailType);
            }
        },
        //登录/注册显示类型点击
        loginType_click: function (in_type: boolean) {
            this.isShow.loginType = in_type;
        },
        isFormat_uid: function (in_str: string) {
            return this.regex.uid.test(in_str);
        },
        isFormat_name: function (in_str: string) {
            return this.regex.name.test(in_str);
        },
        isFormat_passwd: function (in_str: string) {
            return this.regex.passwd.test(in_str);
        },
        load_cache_jwt: function (doErrTip: boolean = true) : boolean {
            const storage = window.localStorage;
            const reUid = storage[this.localStorageNames.uid];
            if(null != reUid && reUid.length > 0) {
                this.userdata.uid = parseInt(reUid);
            }
            const reName = storage[this.localStorageNames.userName];
            if(null != reName && reName.length > 0) {
                this.userdata.name = reName;
            }
            const reJwt = storage[this.localStorageNames.jwt];
            if (null != reJwt && reJwt.length > 0) {
                this.url_s.jwt_user = reJwt;
                this.isShow.detailType = true;
                this.getUserInfo(doErrTip).then((in_bool) => {
                    if(in_bool) {
                        this.isLoginState = true;
                        Global_store().signIn_todo();
                    }
                });
                return true;
            }
            return false;
        },
        get_passwd_solt: async function (
            uid: number | undefined,
            name: string | undefined,
            email: string | undefined,
            doErrTip = true
            ): Promise<string | null> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "未输入用户名或UID"],
                [MyNetStateCode_e.ValueError, "用户名或UID不存在"],
            ]));
            if (uid) {
                const myresp = await this.url_s.getServer_jwt(this.url_s.user.login.getPasswdSolt,
                    {
                        "uid": uid
                    },
                    doErrTip,
                    errTipObj,
                );
                if (myresp.isSuccess()) {
                    return myresp.data;
                }
            } else if (name) {
                const myresp = await this.url_s.getServer_jwt(this.url_s.user.login.getPasswdSolt,
                    {
                        "name": name
                    },
                    doErrTip,
                    errTipObj,
                );
                if (myresp.isSuccess()) {
                    return myresp.data;
                }
            } else if(email) {
                const myresp = await this.url_s.getServer_jwt(this.url_s.user.login.getPasswdSolt,
                    {
                        "email": email
                    },
                    doErrTip,
                    errTipObj,
                );
                if (myresp.isSuccess()) {
                    return myresp.data;
                }
            }
            return null;
        },
        //自动登录
        autoSignIn: async function (doSuccTip: boolean = true, doErrTip : boolean = true): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, ""],
                [MyNetStateCode_e.ValueError, "自动登录失败"],
                [MyNetStateCode_e.LockedError, "账号已被锁定"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.user.login.autoSignIn,
                null,
                {},
                errTipObj,
                doErrTip,
            );
            if (myresp.isSuccess()) {
                this.isLoginState = true;
                let redata = myresp.data;
                this.userdata.uid = redata.uid;
                this.userdata.name = redata.name;
                this.url_s.jwt_user = redata[this.url_s.NAME_jwt_user];
                const storage = window.localStorage;
                storage[this.localStorageNames.jwt] = this.url_s.jwt_user;
                storage[this.localStorageNames.uid] = this.userdata.uid.toString();
                storage[this.localStorageNames.userName] = this.userdata.name;
                this.isShow.detailType = true;
                this.getUserInfo().then((in_bool) => {
                    if(in_bool) {
                        Global_store().signIn_todo();
                    }
                });
                if (doSuccTip) {
                    Global_store().tip(this.userdata.name + " 已登录");
                }
                return true;
            }
            return false;
        },
        //设置自动登录,passwd为加密后的
        set_autoSignIn: async function (isable: boolean, uid: number | undefined, name: string | undefined, passwd: string, doErrTip: boolean = true): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少自动登录必要的信息"],
                [MyNetStateCode_e.ValueError, "设置自动登录失败"],
                [MyNetStateCode_e.LockedError, "账号已被锁定"],
            ]));
            if (uid) {
                const myresp = await this.url_s.postServer_jwt(
                    this.url_s.user.login.setAutoSignIn,
                    null,
                    {
                        "isable": isable,
                        "uid": uid,
                        "passwd": passwd
                    },
                    errTipObj,
                    doErrTip,
                );
                return myresp.isSuccess();
            } else if (name) {
                const myresp = await this.url_s.postServer_jwt(
                    this.url_s.user.login.setAutoSignIn,
                    null,
                    {
                        "isable": isable,
                        "name": name,
                        "passwd": passwd
                    },
                    errTipObj,
                    doErrTip,
                );
                return myresp.isSuccess();
            }
            return false;
        },
        //登录
        signIn: async function (
            uid: number | undefined,
            name: string | undefined,
            email: string | undefined, 
            passwd: string, 
            doTip: boolean = true
            ): Promise<boolean> {
            if (!passwd) {
                return false;
            }
            // 获取密码盐
            let solt = await this.get_passwd_solt(uid, name, email, doTip);
            if (!solt) {
                return false;
            }
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "未输入账号或密码"],
                [MyNetStateCode_e.ValueError, "账号或密码错误"],
                [MyNetStateCode_e.LockedError, "该账号状态异常"],
            ]));
            let passwd_last = sha512(passwd + solt).toString();
            let reqdata = {
                "passwd": passwd_last
            };
            if(uid) {
                reqdata["uid"] = uid;
            } else if(name) {
                reqdata["name"] = name;
            } else {
                reqdata["email"] = email;
            }
            let myresp = await this.url_s.postServer_jwt(
                this.url_s.user.login.signIn,
                null,
                reqdata,
                errTipObj,
                doTip,
            );
            if (myresp.isSuccess()) {
                this.isLoginState = true;
                let redata = myresp.data;
                this.userdata.uid = redata.uid;
                this.userdata.name = redata.name;
                this.url_s.jwt_user = redata[this.url_s.NAME_jwt_user];
                const storage = window.localStorage;
                storage[this.localStorageNames.jwt] = this.url_s.jwt_user;
                storage[this.localStorageNames.uid] = this.userdata.uid.toString();
                storage[this.localStorageNames.userName] = this.userdata.name;
                this.userdata.passwd = passwd;
                this.user_passwd_last = passwd_last;
                this.isShow.detailType = true;
                this.getUserInfo().then((in_bool) => {
                    if(in_bool) {
                        Global_store().signIn_todo();
                    }
                });
                if (doTip) {
                    Global_store().tip(this.userdata.name + " 登录成功");
                }
                return true;
            }
            return false;
        },
        //注册
        signUp: async function (userName: string, 
            passwd: string, 
            email: string, 
            emailcode: number,
            doTip: boolean = true,
            ): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少输入值"],
                [MyNetStateCode_e.ValueError, "输入值的格式错误"],
                [MyNetStateCode_e.RepearError, "该用户名已存在"],
                [MyNetStateCode_e.VerifyError, "邮箱验证码错误"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.user.login.signUp,
                null,
                {
                    "name": userName,
                    "passwd": passwd,
                    "email" : email,
                    "emailcode": emailcode,
                },
                errTipObj,
                doTip,
            );
            if (myresp.isSuccess()) {
                if (doTip) {
                    Global_store().tip("注册成功");
                }
                this.userdata.uid = myresp.data.uid;
                this.userdata.name = myresp.data.name;
                return this.signIn(this.userdata.uid, undefined, undefined, passwd, doTip);
            }
            return false;
        },
        //退出登录
        signOut: async function () {
            this.isLoginState = false;
            await this.remove_user();
            Global_store().tip("已退出登录");
        },
        flushSignIn: async function (doTip: boolean = true): Promise<boolean> {
            if (this.userdata.uid > 0) {
                if (this.userdata.name && this.userdata.passwd && this.userdata.name.length > 0 && this.userdata.passwd.length > 0) {
                    // TODO 检查是否有问题，在signIn后，passwd存入的是passwd_last，而signIn需要的passwd是原本的密码明文
                    return this.signIn(this.userdata.uid, this.userdata.name, undefined, this.userdata.passwd, doTip);
                }
                else {
                    return this.autoSignIn(doTip, doTip);
                }
            }
            return false;
        },
        /*移除用户信息*/
        remove_user: async function () {
            await this.set_autoSignIn(false, this.userdata.uid, this.userdata.name, "");
            const userName = this.userdata.name;
            const uid = this.userdata.uid;
            this.userdata = new UserData_c();
            this.userdata.uid = uid;
            this.userdata.name = userName;
            const storage = window.localStorage;
            storage[this.localStorageNames.jwt] = "";
            Global_store().signOut_todo();
        },
        //获取用户信息
        getUserInfo: async function (doErrTip: boolean = true): Promise<boolean> {
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.user.getInfo,
                {},
                doErrTip);
            if (myresp.isSuccess()) {
                this.userdata.uid = myresp.data.uid;
                this.userdata.name = myresp.data.name;
                this.userdata.email = myresp.data.email;
                this.userdata.phone = myresp.data.phone;
                this.userdata.icon = MySrc_c.fromString<MySrcInfo_c>(myresp.data.icon, new MySrcInfo_c());
                this.userdata.motto = myresp.data.motto;
                this.userdata.sex = myresp.data.sex;
                this.userdata.birthday = myresp.data.birthday;
                this.userdata.level = myresp.data.level;
                this.userdata.experience = myresp.data.experience;
                this.userdata.listen_len = myresp.data.listen_len;
                this.userdata.createPlayList_num = myresp.data.create_playlist_num;
                this.userdata.starPlayList_num = myresp.data.star_playlist_num;
                this.userdata.createLyricNum = myresp.data.create_lyric_num;
                this.userdata.createSongNum = myresp.data.create_song_num;
                return true;
            }
            return false;
        },
        //通过uid数组换取用户公开的数组信息
        load_users_byuids: async function (
            list: Array<number>,
            doErrTip: boolean = true
        ): Promise<Array<UserData_c> | null> {
            if (list.length <= 0)
                return null;
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "未输入UID"],
                [MyNetStateCode_e.ValueError, "UID错误，获取用户信息失败"],
            ]));
            let url = this.url_s.user.bycids + "?uid=" + list[0];
            for (let i = 1, len = list.length; i < len; ++i) {
                url = url + "&uid=" + list[i];
            }
            const myresp = await this.url_s.getServer_jwt(
                url,
                {},
                doErrTip,
                errTipObj,
            );
            if (myresp.isSuccess(true)) {
                if (myresp.data.length > 0) {
                    const relist = new Array<UserData_c>();
                    (<Array<any>>myresp.data).forEach((value, index, array) => {
                        relist.push(UserData_c.fromJson(value));
                    });
                    return relist;
                }
                return [];
            }
            return null;
        },
        post_setInfo: async function (in_icon: MySrc_c<MySrcInfo_c> | undefined,
            in_motto: string | undefined,
            in_sex: number | undefined,
            doErrTip: boolean = true): Promise<boolean> {
            let data: any = {};
            if (in_icon) {
                data.icon = in_icon.toString();
            }
            if (in_motto) {
                data.motto = in_motto;
            }
            if (in_sex) {
                data.sex = in_sex;
            }
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少修改值"],
                [MyNetStateCode_e.ValueError, "修改失败"],
            ]));
            const myresp = await this.url_s.postServer_jwt(this.url_s.user.setInfo,
                null,
                data,
                errTipObj,
                doErrTip,
            );
            return myresp.isSuccess();
        },
        /// 请求用于发送账号绑定邮箱
        /// *   返回下一次发送应当等待的时间长度
        load_bindEmailCode: async function(in_email: string, doErrTip: boolean = true) : Promise<number | null> {
            // 格式验证失败
            if(false == this.regex.email.test(in_email)) {
                if(doErrTip) {
                    Global_store().tip("邮箱格式不正确");
                }
                return null;
            }
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.Toofast, "请求太频繁"],
                [MyNetStateCode_e.ValueHiatusError, "没有输入邮箱"],
                [MyNetStateCode_e.ValueError, "输入的邮箱格式错误"],
                [MyNetStateCode_e.Exception, "服务器异常"],
                [MyNetStateCode_e.RepearError, "该邮箱已被其他账号绑定"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.user.getBindEmailCode,
                {
                    "email": in_email,
                },
                doErrTip,
                errTipObj,
            );
            // 成功发送
            if(myresp.isSuccess()) {
                return myresp.data;
            } else if(MyNetStateCode_e.Toofast == myresp.code) {
                // 请求太快，data中可能指定了剩余时间
                if(null != myresp.data) {
                    return myresp.data;
                }
            }
            return null;
        },
        /// 发送用于修改密码的邮箱验证码
        /// *   返回距离下一次发送的建议时间间隔，单位：s 秒
        load_retrieveEmailCode: async function (in_email :string, doErrTip: boolean = true) : Promise<number | null> {
            // 格式验证失败
            if(false == this.regex.email.test(in_email)) {
                if(doErrTip) {
                    Global_store().tip("邮箱格式不正确");
                }
                return null;
            }
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.Toofast, "请求太频繁"],
                [MyNetStateCode_e.ValueHiatusError, "没有输入邮箱"],
                [MyNetStateCode_e.ValueError, "输入的邮箱格式错误"],
                [MyNetStateCode_e.Exception, "服务器异常"],
                [MyNetStateCode_e.NotFoundError, "该邮箱还没有账号绑定"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.user.getRetrieveEmailCode,
                {
                    "email": in_email,
                },
                doErrTip,
                errTipObj,
            );
            // 成功发送
            if(myresp.isSuccess()) {
                return myresp.data;
            } else if(MyNetStateCode_e.Toofast == myresp.code) {
                // 请求太快，data中可能指定了剩余时间
                if(null != myresp.data) {
                    return myresp.data;
                }
            }
            return null;
        },
        /// 绑定邮箱
        /// *   如果用户已经绑定了邮箱，则不能再修改
        /// *   如果该邮箱已被其他用户绑定，也不能被重复绑定到多个用户上
        post_bindEmail: async function (in_email: string, 
            in_code : number, 
            doErrTip:boolean = true,
            ):Promise<boolean>  {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.VerifyError, "验证码错误"],
                [MyNetStateCode_e.ValueHiatusError, "没有输入邮箱或验证码"],
                [MyNetStateCode_e.ValueError, "输入的邮箱或验证码格式错误"],
                [MyNetStateCode_e.RepearError, "该账号已经绑定了邮箱"],
                [MyNetStateCode_e.Exception, "服务器异常"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.user.setEmail,
                {},
                {
                    "email": in_email,
                    "emailcode": in_code,
                },
                errTipObj,
                doErrTip,
            );
            return myresp.isSuccess();
        },
        // 通过邮箱验证，修改用户密码
        post_retrieve_passwd_byEmail: async function (
            in_email:string,
            in_code:number, 
            in_passwd:string, 
            doErrTip:boolean = true
        ) :Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.VerifyError, "邮箱验证码错误"],
                [MyNetStateCode_e.ValueHiatusError, "没有输入邮箱"],
                [MyNetStateCode_e.ValueError, "邮箱格式错误"],
                [MyNetStateCode_e.NotFoundError, "该邮箱还没有账号绑定"],
                [MyNetStateCode_e.Exception, "服务器异常"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.user.setPasswdByEmail,
                {},
                {
                    "email": in_email,
                    "emailcode": in_code,
                    "passwd": in_passwd,
                },
                errTipObj,
                doErrTip,
            );
            return myresp.isSuccess();
        },
        // 使用旧密码修改新密码，这里的 [old_passwd] 仍然是明文
        post_reset_passwd: async function(
            in_old_passwd:string,
            in_new_passwd:string,
            doErrTip:boolean = true,
        ) : Promise<boolean> {
            // 获取密码盐
            const solt = await this.get_passwd_solt(this.userdata.uid, this.userdata.name, undefined, doErrTip);
            if(!solt) {
                return false;
            }
            let old_passwd = sha512(in_old_passwd + solt).toString(); 
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "没有输入旧密码或新密码"],
                [MyNetStateCode_e.ValueError, "输入旧密码或新密码的格式错误"],
                [MyNetStateCode_e.VerifyError, "旧密码不正确"],
                [MyNetStateCode_e.Exception, "服务器异常"],
            ]));
            // 修改密码
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.user.setPasswd,
                {},
                {
                    "old_passwd":old_passwd,
                    "new_passwd":in_new_passwd,
                },
                errTipObj,
                doErrTip,
            );
            return myresp.isSuccess();
        },
        //显示用户控制信息
        showDetail: function () {
            this.isShow.detail = true;
        },
        //关闭显示用户控制信息
        closeDetail: function () {
            this.isShow.detail = false;
        }
    }
})