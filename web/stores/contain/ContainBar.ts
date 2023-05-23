import { defineStore } from "pinia"
import { FooterBar_store } from "../footer/FooterBar";

import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";
import { ContainTopBar_store } from "./ContainTopBar";

export enum MyRouterPostition_e {
    Undefined = -1,
    MININT = 0,
    MAXINT = 4,

    Home = 0,
    Playlist = 1,
    Lyric = 2,
    User = 3,
    Setting = 4
}

export const ContainBar_store = defineStore(StoreNames.contain.ContainBar, {
    state() {
        return {
            global_s:   Global_store(),

            isShow:{
                detail: true,
                position_index: MyRouterPostition_e.Undefined,
            },
        }
    },
    getters:{},
    actions:{
        showPosition:function(index:MyRouterPostition_e) {
            if(index < MyRouterPostition_e.MININT || index > MyRouterPostition_e.MAXINT) {
                return;
            }
            ContainTopBar_store().closeAll();
            FooterBar_store().closeWarp();
            this.isShow.position_index = index;
        },
        closeAll:function() {
            this.isShow.position_index = MyRouterPostition_e.Undefined;
        },
        showDetail:function() {
            this.isShow.detail = true;
        },
        closeDetail:function() {
            this.isShow.detail = false;
        }
    }
});