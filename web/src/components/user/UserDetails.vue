<script setup>
import { storeToRefs } from 'pinia'
import control from "./Control.vue"
import login from "./Login.vue"
import { User_store } from "../../stores/user/User"

const user_s = User_store();

const {
    isShow
} = storeToRefs(user_s);

</script>

<template>
    <div v-if="isShow.detail" class="cmusic_displayFlexColumn_class">
        <control></control>
        <login></login>
    </div>
</template>