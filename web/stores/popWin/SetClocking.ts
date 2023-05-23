import { defineStore } from "pinia"
import { Global_store } from "../Global";
import { Audio_store } from "../audio/Audio";
import { StoreNames } from "../StoreNames";
import { PopWin_store } from "./PopWin";
import { ContainFunBar_store } from "../contain/ContainFunBar";


export const PopWin_SetClocking_store:any = defineStore(StoreNames.popWin.SetClocking, {
    state: () => {
        return {
            audio_s: Audio_store(),
            popwin_s:PopWin_store(),

            isShow: {
                detail: false,
            },

            addFun: new Function(),
            closeFun: new Function(),
            title: "定时停止播放",

            flushFun: <any>undefined,
            fun_id:-1,
            fun_item: <any>undefined,  //定时器在右侧栏的number
            flushTime: 60 * 1000,     //定时刷新检查间隔时长
            length: 0,     //总时长
            surplus: 0,    //剩余时长
        }
    },
    getters: {
        getLengthHour:function(state) {
            return Math.floor(state.length / 3600);
        },
        getLengthMinute:function(state) {
            return Math.floor((state.length % 3600) / 60);
        },
        getsurplusStr:function(state) {
            return Global_store().showTime_HM_f(state.surplus);
        },
    },
    actions: {
        open:function(in_addFun:Function, in_closeFun:Function) {
            this.addFun = in_addFun;
            this.closeFun = in_closeFun;
            this.isShow.detail = true;
        },
        //确定设置
        confirm:function() {
            //设置定时
            this.setclock();
            if(this.addFun) {
                this.addFun();
            }
        },
        //设置定时
        setclock:function() {
            if (this.length > 0) {
                if(this.flushFun) {     //停止之前的定时器
                    this.stopClocking();
                }
                this.surplus = this.length;
                let flushTime_s = this.flushTime / 1000;
                //设置结束时间戳，单位秒
                //(最后的(this.flushTime / 1000 / 2)是拿来平衡一下因轮询间隔时间无法精准在endTime停止的误差)
                let endTime = Math.floor(Date.now() / 1000 + this.length - (this.flushTime / 1000 / 2));
                //设置定时器
                let _this = this;
                const global_s = Global_store();
                this.flushFun = setInterval(function () {
                        _this.surplus -= flushTime_s;
                        _this.fun_item.text = _this.getsurplusStr;
                        //由于部分场景（如移动端/挂后台）导致定时函数实际执行间隔并非设定的时长，因此增加时间戳判断
                        let nowTime = Math.floor(Date.now() / 1000);
                        //暂停播放
                        if (_this.surplus <= 0 || nowTime >= endTime) {
                            _this.stopClocking();
                            //暂停播放
                            _this.audio_s.audio_pause_click();
                            let date = new Date();
                            let time = 0;
                            //时 getHours()：(0 ~ 23)
                            time += date.getHours() * 3600;
                            //分 getMinutes()： (0 ~ 59)
                            time += date.getMinutes() * 60;
                            global_s.tip(global_s.showTime_HM_f(time) + " 倒计时结束，停止播放");
                            return;
                        }
                    }, this.flushTime);
                global_s.tip(this.getLengthHour + "小时 " + this.getLengthMinute + " 分钟 后停止播放");
                this.fun_id = ContainFunBar_store().addItem("setClocking", this.getsurplusStr, true, () => {
                    _this.popwin_s.open_setclocking(
                        function() {
                            _this.popwin_s.closeDetail();
                        }
                    );
                });  //添加右侧栏定时图标
                this.fun_item = ContainFunBar_store().getItem(this.fun_id);
            }
        },
        //设置时长
        setTime: function (in_length:number) {
            if(in_length < 0) {
                return false;
            }
            this.length = in_length;
        },
        //修改时长
        changeTime: function (in_num:number) {
            this.setTime(this.length + in_num);
        },
        //停止倒计时
        stopClocking: function () {
            if(this.flushFun) {     //停止之前的定时器
                clearInterval(this.flushFun);
                this.flushFun = undefined;
                this.surplus = 0;
                if(this.fun_id > 0) {
                    ContainFunBar_store().removeItem(this.fun_id);     //移除右侧栏的定时图标
                    this.fun_id = -1;
                }
                this.fun_item = undefined;
            }
        },
        stopClocking_click:function() {
            this.stopClocking();
            this.setTime(0);
            Global_store().tip("已停止定时倒计时");
        },
        close: function () {
            this.isShow.detail = false;
            if(this.closeFun) {
              this.closeFun();
            }
        },
        showDetail:function() {
            this.isShow.detail = true;
        },
        closeDetail: function () {
            this.isShow.detail = false;
        }
    }
});