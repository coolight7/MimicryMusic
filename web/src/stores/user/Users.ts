import { defineStore } from "pinia"

import { Global_store } from "../Global"
import { StoreNames } from "../StoreNames";
import { Url_store } from "../Url"

export const UserList_store = defineStore(StoreNames.user.Users, {
    state() {
        return {
            global_s: Global_store(),
            url_s: Url_store(),

            isShow:{
                detail:true,
            },

        }
    },
    getters:{},
    actions:{

    }
});