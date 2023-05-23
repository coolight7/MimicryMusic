import { defineStore } from "pinia";
import { StoreNames } from "./StoreNames";
import { Global_store } from "./Global";
import { MyErrTipStr_c, MyNetStateCode_e, Url_store } from "./Url";

import { MD5, SHA1 } from "crypto-js";
import { MySrcInfo_c, MySrcType_e, MySrc_c } from "../util/MySrc";

export enum SrcIcon {
    addEmail = "addEmail",
    addition = "addtion",
    bili = "bili",
    cancle = "cancle",
    checkRect_d = "checkRect_d",
    checkRect_l = "checkRect_l",
    colorful_d = "colorful_d",
    colorful_l = "colorful_l",
    desktop_d = "desktop_d",
    desktop_l = "desktop_l",
    download = "download",
    download2 = "download2",
    edit = "edit",
    eye_d = "eye_d",
    eye_l = "eye_l",
    history_l = "history_l",
    history_d = "history_d",
    home_d = "home_d",
    home_l = "home_l",
    increase = "increase",
    key_d = "key_d",
    like_d = "like_d",
    like_l = "like_l",
    location = "location",
    lyric_d = "lyric_d",
    lyric_l = "lyric_l",
    menuLeft_d = "menuLeft_d",
    menuLeft_l = "menuLeft_l",
    menuRight_d = "menuRight_d",
    menuRight_l = "menuRight_l",
    mimicrymusic = "mimicrymusic",
    mobile_d = "mobile_d",
    mobile_l = "mobile_l",
    mobileAi_d = "mobileAi_d",
    mobileAi_l = "mobileAi_l",
    moon_d = "moon_d",
    moon_l = "moon_l",
    moreBtn_d = "moreBtn_d",
    moreBtn_l = "moreBtn_l",
    multiple = "multiple",
    music = "music",
    music2 = "music2",
    nextPoint = "nextPoint",
    plane_d = "plane_d",
    plane_l = "plane_l",
    playlist_d = "playlist_d",
    playlist_l = "playlist_l",
    playMedia_hollow = "playMedia_hollow",
    playMedia = "playMedia",
    playOnly = "playOnly",
    playOrder = "playOrder",
    playRand = "playRand",
    pointDoubleLeft = "pointDoubleLeft",
    pointDoubleRight = "pointDoubleRight",
    pointDown_large = "pointDown_large",
    pointDown = "pointDown",
    pointRight_large = "pointRight_large",
    pointRight = "pointRight",
    pointUp = "pointUp",
    position = "position",
    previousPoint = "previousPoint",
    reduce = "reduce",
    right = "right",
    saveFile_d = "saveFile_d",
    search_l = "search_l",
    searchPage = "searchPage",
    selectClock = "selectClock",
    setClocking = "setClocking",
    setting_d = "setting_d",
    setting_l = "setting_l",
    sort = "sort",
    speed = "speed",
    stack_d = "stack_d",
    stack_l = "stack_l",
    star_d = "star_d",
    star_l = "star_l",
    star2_d = "star2_d",
    star2_l = "star2_l",
    stopMedia = "stopMedia",
    subtract = "subtract",
    thumbtask = "thumbtask",
    timeCancle = "timeCancle",
    tip_d = "tip_d",
    tip_l = "tip_l",
    user_d = "user_d",
    user_l = "user_l",
    user_exit = "user_exit",
    userFollow_d = "userFollow_d",
    userHistory_d = "userHistory_d",
    userHistory_l = "userHistory_l",
    userSignIn = "userSignIn",
    userSignUp = "userSignUp",
    volume_zero = "volume_zero",
    volume = "volume",
}

export const Src_store = defineStore(StoreNames.Src, {
    state() {
        return {
            img: {
                mimicryMusic: "/src/images/MimicryMusic.png",
                mimicryMusic_s: "/src/images/MimicryMusic-s.png",
                mimicryMusic_ss: "/src/images/MimicryMusic-ss.png",
                default_song: '/src/images/default_song.png',
                default_song_2: "/src/images/default_song_2.png",
                default_list: '/src/images/default_list.png',
                default_user: '/src/images/gravatar.png',
                music_disable: "/src/images/music_disable.png",
            },
            icon: {
                music_disable: new MySrc_c(new MySrcInfo_c(MySrcType_e.MyLink), "/src/images/music_disable.png"),
            },
            cos: {
                mimicryMusic: "http://mycos1.mimicry.cool/resources/images/default/MimicryMusic.png",
                system: {
                    android: "http://mycos1.mimicry.cool/resources/images/system/android.png",
                    iphone: "http://mycos1.mimicry.cool/resources/images/system/apple.png",
                    macos: "http://mycos1.mimicry.cool/resources/images/system/mac.png",
                    linux: "http://mycos1.mimicry.cool/resources/images/system/linux.png",
                    windows: "http://mycos1.mimicry.cool/resources/images/system/windows.png",
                },
            }
        }
    },
    getters: {},
    actions: {
        //检查是否为DATAURL，是则上传并返回访问链接，否则原样返回
        tryDataURLUpload: async function (in_str: string, doErrTip: boolean = true): Promise<MySrc_c<MySrcInfo_c> | null> {
            const global_s = Global_store();
            global_s.tip("正在上传文件...");
            if (/data:(.*?);base64/g.test(in_str)) {   //检查是否为base64字符串
                //是则转为二进制并上传
                let blob: Blob = global_s.dataURLtoBlob(in_str);
                const reSrc = await this.cos_upload(blob, doErrTip);
                if (null != reSrc) {
                    return reSrc;
                }
            }
            return null;
        },
        cos_upload: async function (data: Blob, doErrTip: boolean = true): Promise<MySrc_c<MySrcInfo_c> | null> {
            const len = data.size;
            if (len > 0) {
                const text = await data.text();
                const hash_md5 = MD5(text).toString();
                const hash_sha1 = SHA1(text).toString();
                const url_s = Url_store();
                // 获取上传链接
                let errTipObj = new MyErrTipStr_c();
                errTipObj.addAll(new Map<number, string>([
                    [MyNetStateCode_e.RepearError, ""],
                    [MyNetStateCode_e.ValueHiatusError, "缺少文件信息"],
                    [MyNetStateCode_e.ValueError, "上传失败"],
                    [MyNetStateCode_e.LimitError, "文件太大，上传失败"],
                    [MyNetStateCode_e.TooMany, "上传次数太多"],
                    [MyNetStateCode_e.Exception, "服务器异常"],
                ]));
                let myresp = await url_s.getServer_jwt(
                    url_s.proxy.cos.uploadGeturl,
                    {
                        "hash_md5": hash_md5,
                        "hash_sha1": hash_sha1,
                        "size": len,
                    },
                    doErrTip,
                    errTipObj,
                );
                let filename: String | null = null;
                if (myresp.isSuccess(true, true)) {
                    filename = myresp.data["name"];
                    let uploadurl = myresp.data["url"];
                    // 上传文件内容
                    let header = new Map<string, any>();
                    header.set("x-cos-meta-md5", hash_md5);
                    const buffer = await data.arrayBuffer();
                    let timeout = (len / (1024 * 1024) * (20 * 1000));
                    if(timeout < 20 * 1000) {
                        timeout = 20 * 1000;
                    }
                    let upload_resp = await url_s.putServer_binary(
                        uploadurl,
                        {},
                        buffer,
                        data.type,
                        header,
                        timeout, // 每1mb允许 20 s
                        doErrTip,
                    );
                    if (null != upload_resp && (upload_resp.status / 200) == 1) {
                        // 成功
                    } else {
                        // 失败
                        filename = null;
                    }
                } else if (myresp.code == MyNetStateCode_e.RepearError) {
                    // 已经存在该文件
                    filename = myresp.data;
                }
                if (null != filename) {
                    // 获取文件下载链接并返回
                    let errTipObj = new MyErrTipStr_c();
                    errTipObj.addAll(new Map<number, string>([
                        [MyNetStateCode_e.ValueHiatusError, "返回的文件名称缺失"],
                        [MyNetStateCode_e.ValueError, "返回的文件名称格式错误"],
                        [MyNetStateCode_e.NotFoundError, "返回的文件名不存在"],
                    ]));
                    let down_myresp = await url_s.getServer_jwt(
                        url_s.proxy.cos.downGeturl,
                        {
                            "name": filename,
                        },
                        doErrTip,
                        errTipObj,
                    );
                    if (down_myresp.isSuccess(true, true)) {
                        return new MySrc_c(
                            new MySrcInfo_c(MySrcType_e.MyCos),
                            down_myresp.data,
                        );
                    }
                }
            }
            return null;
        },
        hasFile_data: async function (in_data: Blob, doErrTip: boolean = true): Promise<MySrc_c<MySrcInfo_c> | null> {
            const text = await in_data.text();
            const hash_md5 = MD5(text).toString();
            const hash_sha1 = SHA1(text).toString();
            const url_s = Url_store();
            const myresp = await url_s.getServer_jwt(
                url_s.src.hasFile,
                {
                    "hash": hash_md5,
                    "hash2": hash_sha1,
                    "alg": 16,
                },
                doErrTip,
            );
            if (myresp.isSuccess(true, true)) {
                return new MySrc_c(
                    new MySrcInfo_c(MySrcType_e.MyLink),
                    myresp.data.toString()
                );
            }
            return null;
        },
        post_upload: async function (in_data: Blob, doErrTip: boolean = true): Promise<MySrc_c<MySrcInfo_c> | null> {
            const reStr = await this.hasFile_data(in_data, doErrTip);
            if (null != reStr) {
                return reStr;
            }
            const global_s = Global_store();
            const url_s = Url_store();
            const buffer = await in_data.arrayBuffer();
            const myresp = await url_s.postServer_binary_jwt(
                url_s.src.upload,
                {},
                buffer,
                in_data.type,
                doErrTip,
            );
            if (myresp.isSuccess(true, true)) {
                return new MySrc_c(
                    new MySrcInfo_c(MySrcType_e.MyLink),
                    url_s.src.get + "?hash=" + <string>myresp.data
                );
            } else {
                global_s.tip("图片上传失败！");
            }
            return null;
        }
    }
})