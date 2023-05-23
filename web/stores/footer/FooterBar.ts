import { defineStore } from "pinia"
import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";

export const FooterBar_store = defineStore(StoreNames.footer.FooterBar, {
    state() {
        return {
            global_s: Global_store(),

            isShow :{
                detail:true,
                rectangle:false,     //播放页面
            }
        }
    },
    getters:{
        isShowWarp:function(state) {
            return state.isShow.rectangle;
        }
    },
    actions:{
        openWarp() {
            this.isShow.rectangle = true;
        },
        closeWarp() {
            this.isShow.rectangle = false;
        }
    }
});
