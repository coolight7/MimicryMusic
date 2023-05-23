import { defineStore } from "pinia"
import { PopWin_SetClocking_store } from "./SetClocking";
import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";
import { Song_c } from "../playList/Song";
import { Playlist_c } from "../playList/Lists";
import { Lyric_c } from "../lyric/Lyric";

export class FooterBtn {
    isShow:boolean = false;
    fun = new Function();
    str:string = "";
}

export const PopWin_store = defineStore(StoreNames.popWin.PopWin, {
    state() {
        return {
            global_s: Global_store(),
            setclocking_s:PopWin_SetClocking_store(),

            isShow:{
                detail:false,
            },
            popup:{
                index:-1,
                enum:{
                    addsong:1,
                    addlist:2,
                    editsong:3,
                    editlist:4,
                    addlyricSrc:5,
                    setclocking:6,
                    selectLyric:7,
                    addlyric:8,
                    editlyric:9,
                    addScriptSrc:10
                },
                data:{
                    editsong:new Song_c(),
                    editlist:new Playlist_c(),
                    editLyric:new Lyric_c(),
                    selectLrcid:-1
                },
                fun:new Array<Function>()
            },
        }
    },
    getters:{},
    actions:{
        open_addsong:function(addFun:Function) {
            this.popup.fun[0] = addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.addsong);
        },
        open_addlist:function(addFun:Function) {
            this.popup.fun[0] = addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.addlist);
        },
        open_editsong:function(addFun:Function, in_song:Song_c) {
            this.popup.data.editsong = in_song;
            this.popup.fun[0] = addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.editsong);
        },
        open_editlist:function(addFun:Function, in_list:Playlist_c) {
            this.popup.data.editlist = in_list;
            this.popup.fun[0] = addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.editlist);
        },
        open_setclocking:function(in_addFun:Function) {
            this.popup.fun[0] = in_addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.setclocking);
        },
        open_addLyricSrc:function(in_addFun:Function) {
            this.popup.fun[0] = in_addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.addlyricSrc);
        },
        open_selectLyric:function(in_selectFun:Function, in_selectedLrcid:number = -1) {
            this.popup.data.selectLrcid = in_selectedLrcid;
            this.popup.fun[0] = in_selectFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.selectLyric);
        },
        open_addLyric:function(in_addFun:Function) {
            this.popup.fun[0] = in_addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.addlyric);
        },
        open_editLyric:function(in_addFun:Function, in_lyric:Lyric_c) {
            this.popup.data.editLyric = in_lyric;
            this.popup.fun[0] = in_addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.editlyric);
        },
        open_addScriptSrc:function(in_addFun:Function) {
            this.popup.fun[0] = in_addFun;
            this.popup.fun[1] = this.closeDetail;
            this.showDetail(this.popup.enum.addScriptSrc);
        },
        showDetail:function(in_index:number) {
            this.popup.index = in_index;
            this.isShow.detail = true;
        },
        closeDetail: function () {
            this.isShow.detail = false;
            this.popup.index = -1;
        }
    }
});