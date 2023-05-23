<script setup lang="ts">
import { storeToRefs } from "pinia";
import { MyHomeTipEntity_c, GlobalComp_store } from "../../stores/global/GlobalComp";

const globalComp_s = GlobalComp_store();

const item_click = (item:MyHomeTipEntity_c, index:number) => {
    if(item.content.length > 0) {
        alert(item.content);
    }
}

const { homeTipData } = storeToRefs(globalComp_s);

</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <div v-for="(item, index) in homeTipData" 
            @click="item_click(item, index)"
            class="cmusic_user_sign_button cmusic_homeTip_item">
            <span class="cmusic_textMain_color" style="white-space:nowrap;overflow: hidden;">{{ item.title }}</span>
            <span class="cmusic_textCross_color" style="font-size: medium;white-space:nowrap;overflow: hidden;">{{ item.depict }}</span>
        </div>
    </div>
</template>

<style>
.cmusic_homeTip_item {
    width: 80%;
    display:flex;
    flex-direction:column;
    position: static;
    padding-left:10px;
    padding-right:10px;
}
</style>
