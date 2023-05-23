import { defineStore } from "pinia"
import { Enable_ListDetails_c } from "../global/GlobalComp"
import { Global_store } from "../Global"
import { ErrValue_c, MyErrTipStr_c, MyNetStateCode_e, Url_store } from "../Url"
import { Song_c, Song_store } from "./Song"
import { PlayList_Songs_store } from "./Songs"
import { PlayList_Lists_store, Playlist_c, Playlist_access_e } from "./Lists"
import { StoreNames } from "../StoreNames"

import { Src_store } from "../Src"
import { Audio_store } from "../audio/Audio"
import { User_store } from "../user/User"
import { myArrayStringify } from "../../util/GlobalUtil"

//播放模式枚举
export enum PlayModel_e {
    order = 1,      //顺序循环
    rand = 2,       //随机播放
    only = 3        //单曲循环
};

/// 歌曲资源可用性记录
class SongSrcAvailableValue_c {
    static limitSubFaildAndSucc: number = 3;

    isAvailable: boolean = true;
    succNum: number = 0;
    faildNum: number = 0;

    constructor(
        isAvailable: boolean = true,
        succNum: number = 0,
        faildNum: number = 0,
    ) {
        this.isAvailable = isAvailable;
        this.succNum = succNum;
        this.faildNum = faildNum;
    }

    flushIsAvailable(): boolean {
        this.isAvailable =
            ((this.faildNum - this.succNum) < SongSrcAvailableValue_c.limitSubFaildAndSucc);
        return this.isAvailable;
    }
}

export const PlayList_store = defineStore(StoreNames.playList.PlayList, {
    state: () => {
        return {
            url_s: Url_store(),
            songs_s: PlayList_Songs_store(),
            lists_s: PlayList_Lists_store(),
            src_s: Src_store(),

            //控制显示
            isShow: {
                bar: true,
                songs: false,
                lists: true,
            },
            /*列表数组
            * 已使用长度：3
            * 0：用户创建列表
            * 1：用户收藏列表
            * 2：历史记录列表
            */
            plists: [new Array<Playlist_c>, new Array<Playlist_c>, new Array<Playlist_c>],
            selectViewList: new Playlist_c(),
            //已选择的列列表
            selectList: new Playlist_c(),
            list_favory: new Playlist_c(),

            /// 当前选择播放列表的歌曲资源的可用性
            /// <src.toString(), isAvailable>
            slistSrcAvailable: new Map<string, SongSrcAvailableValue_c>(),
            /*order:顺序；rand:随机；only:单曲循环；*/
            playType: PlayModel_e.order,
            //当前显示的播放列表归类
            lists_showType: 0,
            songs_enable: new Enable_ListDetails_c(),
            selectSongs_enable: new Enable_ListDetails_c(),
            songs_enable_temp: {      //启用功能
                edit: false,    //编辑
                add: false,    //添加
                order: false,    //排序
                delete: false,    //删除
                focus: true,     //定位
            },
            lists_enable: new Enable_ListDetails_c(),

            default_src: {
                img: Src_store().img.default_list
            },
            lock: {
                time: 10000,
                lists_my: true,
                lists_star: true,
            }
        }
    },
    getters: {
        getSelectList: function (state) {
            return state.selectList;
        },
        getSelectViewList: function (state) {
            return state.selectViewList;
        },
        getShowLists: function (state) {
            return state.plists[state.lists_showType]
        },
        getLists_my: function (state) {
            return state.plists[0];
        },
        getLists_star: function (state) {
            return state.plists[1];
        },
        getLists_history: function (state) {
            return state.plists[2];
        },
        //当前选择的播放列表是否可读取
        isSongsAvailable: function (state) {
            return (state.selectList.pid > 0
                && state.selectList.songAvailable);
        },
    },
    actions: {
        init: function () {
            this.selectList.name = "歌单";

            this.songs_enable.array.add = false;
            this.songs_enable.array.edit = false;
            this.songs_enable.array.order = false;
            this.songs_enable.array.delete = false;

            this.showLists();
        },
        slistSrcIsAvailable: function (): boolean {
            return (this.selectList.songAvailable && true == this.slistSrcAvailableHasTrue());
        },
        /// 检查该歌曲的资源是否是可以播放的
        songSrcIsAvailable: function (in_song: Song_c): boolean {
            // 可以是true || null，即为可用
            const revalue = this.slistSrcAvailable[in_song.audio.toString()];
            return (null == revalue || true == revalue.isAvailable);
        },
        /// 检查当前选中的歌单内是否存在可以播放的歌曲
        slistSrcAvailableHasTrue: function (): boolean {
            for (let i = this.selectList.song.length; i-- > 0;) {
                if (true == this.songSrcIsAvailable(this.selectList.song[i])) {
                    return true;
                }
            }
            return false;
        },
        /// 获取当前歌单内可以播放的歌曲的数量
        slistSrcAvailableGetNum: function (): number {
            let num = 0;
            for (let i = this.selectList.song.length; i-- > 0;) {
                if (true == this.songSrcIsAvailable(this.selectList.song[i])) {
                    ++num;
                }
            }
            return num;
        },
        /// 设置歌曲资源的可用状态
        songSrcAvailableSetItem: function (
            in_song: Song_c,
            isAvailable: boolean | null = null,
            succNum: number | null = null,
            faildNum: number | null = null,
        ): void {
            if (null != succNum && succNum < 0) {
                succNum = 0;
            }
            if (null != faildNum && faildNum < 0) {
                faildNum = 0;
            }
            const key = in_song.audio.toString();
            let revalue = this.slistSrcAvailable[key];
            if (null == revalue) {
                revalue = new SongSrcAvailableValue_c(
                    isAvailable ?? true,
                    succNum ?? 0,
                    faildNum ?? 0,
                );
                this.slistSrcAvailable.set(key, revalue);
            } else {
                if (null != isAvailable) {
                    revalue.isAvailable = isAvailable;
                }
                if (null != succNum) {
                    revalue.succNum = succNum;
                }
                if (null != faildNum) {
                    revalue.faildNum = faildNum;
                }
            }
            revalue.flushIsAvailable();
        },
        /// 偏移指定歌曲的成功播放或失败播放次数
        songSrcAvailableShiftItemNum: function (
            in_song: Song_c,
            succNum: number | null = null,
            faildNum: number | null = null,
        ): void {
            const key = in_song.audio.toString();
            const revalue = this.slistSrcAvailable[key];
            if (null == revalue) {
                this.songSrcAvailableSetItem(
                    in_song,
                    null,
                    succNum,
                    faildNum,
                );
            } else {
                this.songSrcAvailableSetItem(
                    in_song,
                    null,
                    (null != succNum) ? revalue.succNum + succNum : null,
                    (null != faildNum) ? revalue.faildNum + faildNum : null,
                );
            }
        },
        //更新用户信息
        update_userinfo: function () {
            this.setSelectList(this.selectList);
            this.setSelectViewList(this.selectViewList);
        },
        //地址栏参数：指定歌曲
        loadUrlParam_song: function () {
            //选择播放歌曲
            let params_selectsongIndex = parseInt(this.url_s.getParam(this.url_s.paramName.playlist.selectsongIndex));
            if (params_selectsongIndex) {
                console.log("地址栏参数：" + this.url_s.paramName.playlist.selectsongIndex + "=" + params_selectsongIndex);
                if (params_selectsongIndex < 0 || params_selectsongIndex >= this.selectList.song.length) {
                    return;
                }
                Global_store().play_song(this.selectList, this.selectList.song[params_selectsongIndex]);
            }
        },
        //地址栏参数：播放方式
        loadUrlParam_playModel: function () {

        },
        //解析地址栏参数
        loadUrlParam: function () {
            //选择的歌单
            let params_selectList = this.url_s.getParam(this.url_s.paramName.playlist.selectList);
            if (params_selectList) {
                console.log("地址栏参数：" + this.url_s.paramName.playlist.selectList + "=" + params_selectList);
                let item: Playlist_c;
                let _this = this;
                this.load_lists_byPids(
                    [parseInt(params_selectList)],
                    false).then(
                        (res: any) => {
                            if (res.data.data.length == 1) {
                                item = res.data.data[0];
                                _this.lists_item_click(item, true)
                                    .then((res: any) => {
                                        _this.loadUrlParam_song();
                                    });
                            } else {
                                console.warn("地址栏参数错误："
                                    + _this.url_s.paramName.playlist.selectList + "=" + params_selectList
                                    + " | 获取对应的歌单信息时出错:data=" + res.data.data);
                            }
                        }
                    ).catch((err: any) => {
                        console.warn("地址栏参数错误："
                            + _this.url_s.paramName.playlist.selectList + "=" + params_selectList
                            + " | 获取对应的歌单信息时出错:data=" + err.data.code);
                    });
            }
        },
        setSelectViewList: function (in_list: Playlist_c) {
            this.selectViewList = in_list;
            if (this.selectViewList.pid === -1
                || this.selectViewList.uid === -1
                || this.selectViewList.uid != User_store().getUserCid) {
                this.songs_enable = new Enable_ListDetails_c();
                this.songs_enable.array.add = false;
                this.songs_enable.array.edit = false;
                this.songs_enable.array.order = false;
                this.songs_enable.array.delete = false;
            } else {
                this.songs_enable = new Enable_ListDetails_c();
            }
        },
        setSelectList: function (in_list: Playlist_c) {
            if (this.selectList.pid != in_list.pid) {
                this.slistSrcAvailable.clear();
            }
            this.selectList = in_list;
            if (this.selectList.pid === -1
                || this.selectList.uid === -1
                || this.selectList.uid != User_store().getUserCid) {
                this.selectSongs_enable = new Enable_ListDetails_c();
                this.selectSongs_enable.array.add = false;
                this.selectSongs_enable.array.edit = false;
                this.selectSongs_enable.array.order = false;
                this.selectSongs_enable.array.delete = false;
            } else {
                this.selectSongs_enable = new Enable_ListDetails_c();
            }
        },
        setLists_my: function (in_lists: Array<Playlist_c>) {
            this.plists[0] = in_lists;
        },
        setLists_star: function (in_lists: Array<Playlist_c>) {
            for (let i = in_lists.length; i-- > 0;) {
                in_lists[i].isstar = true;
            }
            this.plists[1] = in_lists;
        },
        setLists_history: function (in_lists: Array<Playlist_c>) {
            this.plists[2] = in_lists;
        },
        //获取当前播放歌曲在已选歌单中的位置
        //如果不存在则返回-1，否则返回下标，从0开始
        getSelectSongIndex: function () {
            let songs = this.selectList;
            let song = Song_store().getSelectSong;
            if (songs.pid < 0
                || song.sid < 0) {
                return -1;
            }
            for (let i = songs.song.length; i-- > 0;) {
                if ((songs.song)[i].sid == song.sid) {
                    return i;
                }
            }
            return -1;
        },
        /*播放列表框显示的内容类型*/
        showType_click: function () {
            if (this.isShow.songs) {
                this.showLists();
            } else {
                this.showSongs();
            }
        },
        showSongs: function () {
            this.isShow.songs = true;
            this.isShow.lists = false;
        },
        showLists: function () {
            this.isShow.songs = false;
            this.isShow.lists = true;
        },
        lists_item_click: async function (item: Playlist_c, doErrTip: boolean = true): Promise<boolean> {
            if (item.songAvailable == false) {
                let passwd: string | null = "";
                if (User_store().getUserCid == item.uid) {
                    //是本人则过
                } else if (item.access == Playlist_access_e.Private) {
                    Global_store().tip("您不可访问这个私密的歌单");
                    return false;
                } else if (item.access == Playlist_access_e.Protected) {
                    //不是本人并且需要访问密码
                    passwd = prompt("请输入该歌单的访问密码：");
                    if (!passwd) {
                        Global_store().tip("访问密码不能为空");
                        return false;
                    }
                }
                item.passwd = passwd;
                const relist = await this.lists_s.load_playList_song(item, doErrTip);
                if (null != relist) {
                    item.song = relist;
                    item.songAvailable = true;
                    this.setSelectViewList(item);
                    //如果这个播放列表不是自己创建的并且没有收藏，则在历史列表的头部插入
                    if (item.uid != User_store().getUserCid && item.isstar == false) {
                        this.getLists_history.unshift(item);
                    }
                    this.showSongs();    /*转换显示播放列表*/
                    return true;
                }
            } else {
                this.setSelectViewList(item);
                this.showSongs();    /*转换显示播放列表*/
                return true;
            }
            return false;
        },
        //播放列表类别按钮
        my_click: function () {
            this.lists_showType = 0;
            //模拟加锁
            if (this.lock.lists_my == false) {
                return;
            }
            this.lock.lists_my = false;
            let _this = this;
            this.load_playList_create(true);
            this.lists_enable = {
                array: {
                    edit: true,
                    add: true,        //创建
                    order: true,        //排序
                    delete: true,        //移除
                    focus: false,       //定位
                },
                item: {
                    edit: true,      //编辑
                    interact: true,      //互动
                },
            }
            setTimeout(function () {
                _this.lock.lists_my = true;
            }, this.lock.time);
        },
        star_click: function () {
            this.lists_showType = 1;
            if (this.lock.lists_star == false) {
                return;
            }
            this.lock.lists_star = false;
            let _this = this;
            this.load_playList_star(true);
            setTimeout(function () {
                _this.lock.lists_star = true;
            }, this.lock.time);
            this.lists_enable = {
                array: {
                    edit: true,
                    add: false,       //创建
                    order: true,        //排序
                    delete: true,        //移除
                    focus: false,        //定位
                },
                item: {
                    edit: true,      //编辑
                    interact: true,      //互动
                },
            }
        },
        history_click: function () {
            this.lists_showType = 2;
            this.lists_enable = {
                array: {
                    edit: true,
                    add: false,       //创建
                    order: true,        //排序
                    delete: true,        //移除
                    focus: false,        //定位
                },
                item: {
                    edit: true,      //编辑
                    interact: true,      //互动
                },
            }
        },
        /*上一曲按钮*/
        prev_click: async function () {
            if (this.selectList.songAvailable != true) {
                Global_store().tip("请先选择歌单");
                return;
            }
            if (false == this.slistSrcIsAvailable()) {
                Global_store().tip("当前歌单内的歌曲都不能播放，请刷新或选择其他歌单");
                return;
            }
            let song_index: number = -1, num: number = 0;
            let ssongs = this.selectList.song;
            let model = this.playType;
            do {
                if (model == PlayModel_e.rand) {
                    // 随机播放
                    let randInt = ssongs.length - 1;
                    if (randInt < 1) {
                        randInt = 1;
                    }
                    song_index = Math.floor(Math.random() * randInt);
                } else if (model == PlayModel_e.order || model == PlayModel_e.only) {
                    // 顺序播放和单曲循环
                    song_index = this.getSelectSongIndex();
                    if (song_index <= 0) {
                        song_index = (ssongs.length - 1);
                    } else {
                        --song_index;
                    }
                }
                ++num;
                // 如果选中的歌曲不可播放，则再次循环选择
            } while (num <= ssongs.length &&
                false == this.songSrcIsAvailable(ssongs[song_index]));
            await Global_store().play_song(this.selectList, ssongs[song_index]);
            Audio_store().doPlay();
            return;
        },
        /*下一曲按钮
        * click_bool:是否为点击按钮触发，用于区分单曲循环时的功能
        */
        next_click: async function (isClick: boolean, ignoreDisableResetSong: boolean = false) {
            if (this.selectList.songAvailable != true) {
                Global_store().tip("请先选择歌单");
                return;
            }
            if (false == this.slistSrcIsAvailable()) {
                Global_store().tip("当前歌单内的歌曲都不能播放，请刷新或选择其他歌单");
                return;
            }
            let song_index: number = -1, num: number = 0;
            let ssongs = this.selectList.song;
            let model = this.playType;
            do {
                if (model == PlayModel_e.rand) {
                    // 随机播放
                    let randInt = ssongs.length - 1;
                    if (randInt < 1) {
                        randInt = 1;
                    }
                    song_index = Math.floor(Math.random() * randInt);
                    model = PlayModel_e.order;
                } else if (model == PlayModel_e.order ||
                    (model == PlayModel_e.only && isClick == true)) {
                    // 顺序播放 和 单曲循环（需要切换歌曲）
                    song_index = this.getSelectSongIndex();
                    if (song_index >= (ssongs.length - 1)) {
                        song_index = 0;
                    } else {
                        ++song_index;
                    }
                } else {
                    // 单曲循环，且不切换歌曲
                    song_index = this.getSelectSongIndex();
                    model = PlayModel_e.order;
                }
                ++num;
            } while (num <= ssongs.length &&
                false == this.songSrcIsAvailable(ssongs[song_index]));
            await Global_store().play_song(this.selectList, ssongs[song_index]);
            Audio_store().doPlay();
            return;
        },
        /*播放模式按钮*/
        playModel_click: function () {
            if (this.playType == PlayModel_e.order)
                this.playType = PlayModel_e.rand;
            else if (this.playType == PlayModel_e.rand)
                this.playType = PlayModel_e.only;
            else
                this.playType = PlayModel_e.order;
        },
        //创建歌单
        post_createlist: async function (
            in_list: Playlist_c,
            doErrTip: boolean = true
        ): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少输入创建歌单所需信息"],
                [MyNetStateCode_e.ValueError, "输入信息有误，歌单创建失败"],
                [MyNetStateCode_e.Exception, "歌单创建失败"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                this.url_s.playList.add.list,
                null,
                {
                    name: in_list.name,
                    access: in_list.access,
                    icon: in_list.icon.toString(),
                    passwd: in_list.passwd,
                    depict: in_list.depict
                },
                errTipObj,
                doErrTip,
            );
            if (myresp.isSuccess()) {
                this.load_playList_create();
                return true;
            }
            return false;
        },
        //移除一个创建/收藏的歌单
        post_removelist: async function (
            in_list: Playlist_c,
            doSuccFun: boolean = true,
            doTip: boolean = true,
        ): Promise<boolean> {
            let remove_url = "", doflush = -1;//doflush: 1刷新创建的歌单，2刷新收藏歌单
            if (in_list.uid == User_store().getUserCid) {
                remove_url = this.url_s.playList.remove.create;
                doflush = 1;
            } else {
                remove_url = this.url_s.playList.remove.star;
                doflush = 2;
            }
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少希望删除的歌单ID"],
                [MyNetStateCode_e.RepearError, "已收藏该歌单"],
            ]));
            const myresp = await this.url_s.postServer_jwt(
                remove_url,
                {
                    pid: in_list.pid
                },
                null,
                errTipObj,
                doTip,
            );
            const rebool = myresp.isSuccess();
            if (true == rebool) {
                //刷新播放列表
                if (doSuccFun) {
                    if (doflush == 1) {
                        this.load_playList_create();
                    } else if (doflush == 2) {
                        this.load_playList_star();
                    }
                }
            }
            return rebool;
        },
        //发送请求修改歌单包含的歌曲
        post_setSongs: async function (in_list: Playlist_c,
            doErrTip: boolean = true): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少希望修改的歌单ID或歌曲列表"],
                [MyNetStateCode_e.ValueError, "输入信息有误，修改失败"],
            ]));
            let songJsons: string = myArrayStringify(in_list.song, (item, index) => {
                return item.toString();
            });
            const myresp = await this.url_s.postServer_json_jwt(
                this.url_s.playList.set.song,
                {
                    pid: in_list.pid
                },
                songJsons,
                doErrTip,
                errTipObj,
            );
            return myresp.isSuccess();
        },
        //发送请求修改创建歌单的列表
        post_setCreateLists: async function (in_pids: Array<number>,
            doErrTip: boolean = true): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少歌单ID"],
                [MyNetStateCode_e.ValueError, "歌单重排序失败"],
            ]));
            const myresp = await this.url_s.postServer_json_jwt(
                this.url_s.playList.order.list.create,
                {},
                JSON.stringify(in_pids),
                doErrTip,
                errTipObj,
            );
            return myresp.isSuccess();
        },
        //发送请求修改收藏歌单的列表
        post_setStarLists: async function (in_pids: Array<number>,
            doErrTip: boolean = true): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.ValueHiatusError, "缺少歌单ID"],
                [MyNetStateCode_e.ValueError, "歌单重排序失败"],
            ]));
            const myresp = await this.url_s.postServer_json_jwt(
                this.url_s.playList.order.list.star,
                {},
                JSON.stringify(in_pids),
                doErrTip,
                errTipObj,
            );
            return myresp.isSuccess();
        },
        //用cplayid数组换取列表信息,但不包含里面的song
        load_lists_byPids: async function (list: Array<number>, doErrTip: boolean = true, limit_state:boolean = true): Promise<Array<Playlist_c> | null> {
            if (list.length > 0) {
                let url = this.url_s.playList.get.bycplayids + "?limit_state=" + limit_state + "&pid=" + list[0];
                for (let i = 1, len = list.length; i < len; ++i) {
                    if(list[i] >= 0) {
                        url = url + "&pid=" + list[i];
                    }
                }
                const errTipObj = new MyErrTipStr_c();
                errTipObj.addAll(new Map<number, string>([
                    [MyNetStateCode_e.ValueHiatusError, "未输入歌单ID"],
                    [MyNetStateCode_e.ValueError, "歌单信息获取失败"],
                ]));
                const myresp = await this.url_s.getServer_jwt(
                    url,
                    {},
                    doErrTip,
                    errTipObj,
                );
                let reData = <Array<any>>(myresp.data);
                let data = new Array<Playlist_c>();
                //添加内容
                for (let i = 0, len = reData.length; i < len; ++i) {
                    data.push(Playlist_c.fromJson(reData[i]));
                    data[i].songAvailable = false;
                    data[i].islove = false;
                    data[i].isstar = false;
                    if (!data[i].passwd) {
                        data[i].passwd = "";
                    }
                }
                //将结果排序成请求id的顺序
                for (let i = 0, j = 0; i < list.length && j < data.length; ++i) {
                    let k = j;
                    for (; k < data.length && data[k].pid != list[i]; ++k);
                    if (k != data.length) {
                        let temp = data[j];
                        data[j] = data[k];
                        data[k] = temp;
                        ++j;
                    }
                }
                return data;
            }
            return null;
        },
        //加载用户创建的播放列表和收藏的播放列表,但不包含song
        load_playList_create: async function (doErrTip: boolean = true): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.Exception, "加载创建的歌单时失败"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.playList.get.user.create,
                {},
                doErrTip,
                errTipObj,
            );
            if (myresp.isSuccess(true)) {
                if(myresp.data.length > 0 ) {
                    const reList = await this.load_lists_byPids(myresp.data,
                        doErrTip);
                    if (null != reList) {
                        this.setLists_my(reList);
                        return true;
                    }
                } else {
                    this.setLists_my([]);
                    return true;
                }
            }
            return false;
        },
        load_playList_star: async function (doErrTip: boolean = true): Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.Exception, "加载收藏的歌单失败"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.playList.get.user.star,
                {},
                doErrTip,
                errTipObj,
            );
            if (myresp.isSuccess(true)) {
                if(myresp.data.length > 0) {
                    const reList = await this.load_lists_byPids(myresp.data,
                        doErrTip,
                        false,
                    );
                    if (null != reList) {
                        this.setLists_star(reList);
                        return true;
                    }
                } else {
                    this.setLists_star([]);
                    return true;
                }
            }
            return false;
        },
        load_playlist_favory: async function(
            doErrTip: boolean = true,
        ) :Promise<boolean> {
            const errTipObj = new MyErrTipStr_c();
            errTipObj.addAll(new Map<number, string>([
                [MyNetStateCode_e.Exception, "加载 最喜欢的音乐 失败"],
            ]));
            const myresp = await this.url_s.getServer_jwt(
                this.url_s.playList.get.user.favory,
                {},
                doErrTip,
                errTipObj,
            );
            if(myresp.isSuccess(true, true)) {
                let pid:number = parseInt(myresp.data);
                if(pid >= 0) {
                    const relist = await this.load_lists_byPids([pid], doErrTip);
                    if(null != relist && relist.length == 1) {
                        this.list_favory = relist[0];
                        return true;
                    }
                }
            }
            return false;
        },
        //移除plists中的一个
        remove_lists: function (index: number) {
            if (index < 0 || index > this.plists.length) {
                return;
            }
            this.plists[index] = [];
        },
        remove_playlist_favory:function() {
            this.list_favory = new Playlist_c();
        },
        //移除已选列表信息
        remove_selectList: function () {
            this.setSelectViewList(new Playlist_c());
        },
    }
})  