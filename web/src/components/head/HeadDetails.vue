<script setup lang="ts">
import { storeToRefs } from 'pinia'
import tipbarVue from "../tip/TipBar.vue"
import userbarVue from "../user/Bar.vue"
import popwinVue from '../popWin/PopWinDetails.vue';
import { Style_store } from "../../stores/Style";
import { Setting_store } from '../../stores/setting/Setting';

const {
    cmusic_content_style
} = storeToRefs(Style_store());

const {
    isable
} = storeToRefs(Setting_store());

</script>

<template>
    <!-- 头部 -->
    <div class="cwin_displayFlexColumn" style="height:40px;">
        <div class="cmusic_topBar">
            <div :style="cmusic_content_style" class="cwin_displayFlex cmusic_between">
                <tipbar-vue style="margin-right: 10px;" />
                <userbar-vue />
            </div>
        </div>
        <!-- popwin -->
        <popwin-vue />
    </div>
</template>