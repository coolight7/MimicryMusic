import { defineStore } from "pinia"
import { FooterBar_store } from "../footer/FooterBar";

import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";
import { ContainBar_store } from "./ContainBar";

export const ContainTopBar_store = defineStore(StoreNames.contain.ContainTopBar, {
    state() {
        return {
            global_s:   Global_store(),

            isShow:{
                detail:true,
                position_index:-1,
            },
        }
    },
    getters:{},
    actions:{
        showPosition:function(index:number) {
            if(index < 0 || index > 1) {
                return;
            }
            ContainBar_store().closeAll();
            FooterBar_store().closeWarp();
            this.isShow.position_index = index;
        },
        closeAll:function() {
            this.isShow.position_index = -1;
        }
    }
});