<script setup lang="ts">
import { FooterBtn } from "../../stores/popWin/PopWin"
import MyBtn from '../global/MyBtn.vue';

const props = defineProps({
    btns:{
        type:Array<FooterBtn>
    }
})

</script>

<template>
    <div class="cwin_displayFlex cwin_footerBtn_div" 
    style="justify-content: center;align-items: center;">
        <MyBtn v-for="(item, index) in props.btns" :key="index"
            v-show="item.isShow" @click="item.fun()"
            :text="item.str" />
    </div>
</template>