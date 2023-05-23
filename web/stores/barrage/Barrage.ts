import { defineStore } from "pinia"

import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";

import $ from 'jquery';

export const Barrage_store = defineStore(StoreNames.barrage.Barrage, {
    state() {
        return {
            global_s:   Global_store(),

            barrageDiv:undefined,

            list:[],
        }
    },
    getters:{},
    actions:{
        //添加弹幕
        /*  in_str:     "弹幕内容"
        *   speed:1000  弹幕移动速度
        *   from_pos:{  弹幕初始位置(百分比数值)
                top:50,
                left:0,
            }
            to_pos:{    弹幕目标位置（百分比数值）
                top:50,
                left:100,
            }
        */
        addBarrage:function(
            in_str:string, 
            speed:number = 15000,
            from_pos:{top:number, right:number} = {
                top:    -1,
                right:   -1,
            },
            to_pos:{top:number, right:number}   = {
                top:    -1,
                right:   100,
            }) {
            if(from_pos.top < 0 || from_pos.top > 100) {
                from_pos.top = Math.random() * 90;
            }
            if(to_pos.top < 0 || to_pos.top > 100) {
                to_pos.top = from_pos.top;
            }
            
            let $item = $('<span class="cmusic_barrage_item">' + in_str + '</span>');
            $item.css({     //设置初始位置
                top:    from_pos.top + "%",
                right:   (from_pos.right === -1)?("-1000%"):(from_pos.right + "%"),
            });
            $(".cmusic_barrage_div").append($item);  //添加进html
            $item.css({
                right: -$item[0].clientWidth,
            })
            $item.animate({ //设置目标位置动画和移除函数
                top:    to_pos.top + "%",
                right:   to_pos.right + "%"
            }, speed, function() {
                $item.remove();
            });
        },
        //清空弹幕
        clear:function() {
            $(".cmusic_barrage_div").empty();
        },
    }
});