import { defineStore } from "pinia"
import { Device_store } from "./Device";
import { Global_store } from "./Global";
import { StoreNames } from "./StoreNames";

export const Style_store = defineStore(StoreNames.Style, {
    state() {
        return {
            global_s:Global_store(),
            cmusic_wrap_div_style:{
                width:"95%",
                height:"330px"
            },
            cmusic_content_style:{
                width:"95%"
            },
            cmusic_containContent_style:{
                width:"100%"
            },
            popWin:{
                popWin_height:  "",
                content_height: "",
            }
        }
    },
    getters: {
        cmusic_containContent_width_toInt:function(state) {
            if(state.cmusic_containContent_style.width != "700px") {
                return "100%";
            } else {
                return 700;
            }
        }
    },
    actions: {
        init:function() {
            this.popWin.popWin_height = "height:100%;";
            this.popWin.content_height = "height:auto;";
        },
        //适应宽度
        autoResize: function () {
            // 当前设备是移动设备
            if (Device_store().getDeviceType == 1) {
                this.cmusic_content_style.width = "95%";
            } else {
                if (document.body.clientWidth <= 740) {
                    this.cmusic_content_style.width = "95%";
                } else {
                    this.cmusic_content_style.width = "700px";
                }
            }
            this.cmusic_wrap_div_style.width = this.cmusic_content_style.width;
            this.cmusic_containContent_style = this.cmusic_content_style;
        },
    }
});