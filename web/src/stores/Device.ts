import { defineStore } from "pinia"
import { StoreNames } from "./StoreNames";
import { Style_store } from "./Style";

export const Device_store = defineStore(StoreNames.Device, {
    state() {
        return {

            /*设备类型
            * 0:桌面端
            * 1:移动端
            */
            type: 0,
            /*选择的类型
            * 100：自适应
            * 0：桌面端
            * 1：移动端
            */
            select_type: 100,
            /*缩放比例*/
            view_zoom: 1,
        }
    },
    getters: {
        /*获取真实设备类型*/
        getRealDeviceType: function (state) {
            if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
                return 1;
            } else {
                return 0;
            }
        },
        /*获取设备类型（不一定是真实类型）*/
        getDeviceType: function (state) {
            switch (state.select_type) {
                case 0: return 0;
                case 1: return 1;
                case 100: {
                    return state.type;
                } break;
                default: return state.type;
            }
        },
    },
    actions: {
        init:function() {
            this.autoSetRealDeviceType();
        },
        setSelectType:function(in_type:number) {
            this.select_type = in_type;
            //重设缩放view_zoom
            this.autoViewZoom();
            //重设大小
            Style_store().autoResize();
        },
        autoSetRealDeviceType:function() {
            this.type = this.getRealDeviceType;
        },
        //自动设置view_zoom
        autoViewZoom: function() {
            if(this.getDeviceType == 1) {
                //移动端
                this.view_zoom = document.body.clientWidth * this.view_zoom / 500.0;
                document.getElementsByTagName('body')[0].style.cssText = 'zoom:' + this.view_zoom + '';
            }else{
                //桌面端
                this.view_zoom = 1;
                document.getElementsByTagName('body')[0].style.cssText = 'zoom:' + this.view_zoom + '';
            }
        },
        setViewZoom:function(in_zoom:number) {
            if(in_zoom > 0) {
                this.view_zoom = in_zoom;
                document.getElementsByTagName('body')[0].style.cssText = 'zoom:' + this.view_zoom + '';
            }
        }
    }
})