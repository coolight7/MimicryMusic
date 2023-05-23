import { defineStore } from "pinia"

import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames"
import { Url_store } from "../Url"

import { Src_store } from "../Src"

export const PlayList_Songs_store = defineStore(StoreNames.playList.Songs, {
    state() {
        return {
            global_s: Global_store(),
            url_s: Url_store(),
            src_s:Src_store(),

            isShow:{
                detail:true,
            },

            default_src: {
                img: Src_store().img.default_list,
            },
        }
    },
    getters:{},
    actions:{
        showDetail:function() {
            this.isShow.detail = true;
        },
        closeDetail: function () {
            this.isShow.detail = false;
        }
    }
})