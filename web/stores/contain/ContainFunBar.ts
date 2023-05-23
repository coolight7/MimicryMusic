import { defineStore } from "pinia"
import { StoreNames } from "../StoreNames";

export class FunItem_c {
    iconName:string = "";
    text:string = "";
    isselected = true;
    clickFun = (item:[number, FunItem_c]) => {};

    constructor(in_iconName:string, in_text:string, in_isselected:boolean = true, in_clickFun = (item:[number, FunItem_c]) => {}) {
        this.iconName = in_iconName;
        this.text = in_text;
        this.isselected = in_isselected;
        this.clickFun = in_clickFun;
    }
};

export const ContainFunBar_store = defineStore(StoreNames.contain.ContainFunBar, {
    state:() => {
        return {
            isShow:{
                detail:true,
            },
            FunitemId:1,
            funMap:new Map<number, FunItem_c>()
        }
    },
    getters:{},
    actions:{
        addItem:function(in_iconName:string, 
            in_text:string, 
            in_isselected:boolean = true, 
            in_clickFun = (item:[number, FunItem_c]) => {}) :number {
            if(in_iconName && in_text) {
                this.funMap.set(this.FunitemId, new FunItem_c(in_iconName, in_text, in_isselected, in_clickFun));
                return this.FunitemId++;
            } else {
                return -1;
            }
        },
        removeItem:function(in_id:number):boolean {
            if(this.funMap.has(in_id)) {
                this.funMap.delete(in_id);
                return true;
            } else {
                return false;
            }
        },
        getItem:function(in_id:number) {
            return this.funMap.get(in_id);
        },
        clearAll:function() {
            this.funMap.clear();
        },
        showDetail:function() {
            this.isShow.detail = true;
        },
        closeDetail:function() {
            this.isShow.detail = false;
        }
    }
})