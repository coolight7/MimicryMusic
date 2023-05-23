import { defineStore } from "pinia"
import { StoreNames } from "../StoreNames";

export const TipBar_store = defineStore(StoreNames.tip.TipBar, {
    state:() => {
        return {
            isShow: true,

            isShowTip: false,    //是否显示提示内容
            isCasual: false,     //是否是临时显示
            isAnimate: false,    //用于显示动画

            showTime: 3000,
            strList: new Array<string>(),
            showIndex: 0,
        }
    },
    getters: {

    },
    actions: {
        /*提示信息栏按钮*/
        tip_last_click: function () {
            if (this.showIndex <= 0)
                this.showIndex = (this.strList.length - 1);
            else
                --(this.showIndex);
        },
        tip_next_click: function () {
            if (this.showIndex >= (this.strList.length - 1))
                this.showIndex = 0;
            else
                ++(this.showIndex);
        },
        /*反转tip栏显示，一般只由用户点击按钮调用*/
        tipBtn_click: function () {
            if (this.isShowTip == true) { //隐藏
                this.isShowTip = false;
                this.isAnimate = false;
            } else {//显示
                this.isShowTip = true;
                this.isAnimate = true;
                let _this = this;
                setTimeout(function () {
                    _this.isAnimate = false;
                }, this.showTime);
            }
            this.isCasual = false;
        },
        /*显示提示信息, 默认提示3秒
        * tipStr:增加的提示信息内容，undefine时只显示提示栏，不新增信息
        * time：显示时间（如果tip处于关闭状态，则会显示time时长之后收回）
        */
        tip:function(tipStr:string, time:number = -1) {
            this.strList.push(tipStr);
            this.showIndex = this.strList.length - 1;
            let _this = this;
            //如果提示栏处于关闭状态,或者是临时显示状态
            if (this.isShowTip == false || this.isCasual == true) {
                //显示提示栏
                this.isShowTip = true;
                //动画
                this.isAnimate = true;
                setTimeout(function () {
                    _this.isAnimate = false;
                }, this.showTime);
                //设置为临时显示状态
                this.isCasual = true;
                if (time == -1) {
                    time = this.showTime;
                }
                let length = this.strList.length;
                //延时关闭提示栏
                setTimeout(function () {
                    //如果消息队列中的消息数量没变，说明没有新增消息,并且提示栏处于临时显示状态
                    //则这个延时函数可以关闭提示栏，否则关闭操作将由新消息生成的延时函数来完成或是不关闭
                    //由此实现当新增消息时，提示栏的显示时间会增加，并且用户主动点击后不再控制提示栏的显示
                    if (length == _this.strList.length
                        && _this.isCasual == true) {
                        _this.isShowTip = false;
                        _this.isCasual = false;
                        _this.isAnimate = false;
                    }
                }, time);
            } else {
                this.isAnimate = true;
                setTimeout(function () {
                    _this.isAnimate = false;
                }, this.showTime);
            }
        },
    }
})