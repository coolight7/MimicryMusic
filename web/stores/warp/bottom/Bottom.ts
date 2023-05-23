import { defineStore } from "pinia"

import { Global_store } from "../../Global"
import { StoreNames } from "../../StoreNames";
import { Style_store } from "../../Style";

export const WarpBottom_store = defineStore(StoreNames.warp.bottom.Bottom, {
    state() {
        return {
            global_s:   Global_store(),
            style_s:    Style_store(),

            cmusic_warp_div: <any>undefined,

            isShow:{
                position_index:0,
            },
            enums:{
                position_index:{
                    empty:      0,

                    begin:      1,
                    end:        5,

                    moreBtn:    1,
                    user:       2,
                    lyric:      3,
                    playlist:   4,
                    setting:    5,
                }
            }
        }
    },
    getters:{
        getEnums():any {
            return this.enums;
        }
    },
    actions:{
        showPosition(index:number) {
            if(index < this.enums.position_index.begin || index > this.enums.position_index.end) {
                return;
            }
            if(index == this.isShow.position_index) { 
                this.isShow.position_index = this.enums.position_index.empty;
                let h = this.cmusic_warp_div.clientHeight;
                if(h > 0) {
                    this.style_s.cmusic_wrap_div_style.height = "330px";
                } else {
                    this.style_s.cmusic_wrap_div_style.height = "auto";
                }
            } else {
                this.isShow.position_index = index;
                let h = this.cmusic_warp_div.clientHeight;
                if(h > 0) {
                    this.style_s.cmusic_wrap_div_style.height = "550px";
                } else {
                    this.style_s.cmusic_wrap_div_style.height = "auto";
                }
            }
        }
    }
});