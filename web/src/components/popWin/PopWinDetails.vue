<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { PopWin_store } from "../../stores/popWin/PopWin";
import addsongVue from './AddSong.vue';
import addlistVue from './AddList.vue';
import editsonginfoVue from './EditSongInfo.vue';
import editlistinfoVue from './EditListInfo.vue';
import setclockingVue from './SetClocking.vue';
import AddLyricSrcVue from './AddLyricSrc.vue';
import SelectLyricVue from './SelectLyric.vue';
import AddLyricVue from './AddLyric.vue';
import EditLyricInfoVue from './EditLyricInfo.vue';
import AddScriptSrcVue from './AddScriptSrc.vue';

const {
  isShow,
  popup,
} = storeToRefs(PopWin_store());

</script>

<template>
    <!-- 弹出窗口的背景 -->
    <div v-if="isShow.detail" class="cwin_displayFlexColumn">
        <addsong-vue v-if="popup.index == popup.enum.addsong" @add="popup.fun[0]" @cancle="popup.fun[1]" />
        <addlist-vue v-if="popup.index == popup.enum.addlist" @add="popup.fun[0]" @cancle="popup.fun[1]" />
        <editsonginfo-vue v-if="popup.index == popup.enum.editsong" :song="popup.data.editsong" @save="popup.fun[0]" @cancle="popup.fun[1]" />
        <editlistinfo-vue v-if="popup.index == popup.enum.editlist" :list="popup.data.editlist" @save="popup.fun[0]" @cancle="popup.fun[1]" />
        <setclocking-vue v-if="popup.index == popup.enum.setclocking" @add="popup.fun[0]" @cancle="popup.fun[1]" />
        <AddLyricSrcVue v-if="popup.index == popup.enum.addlyricSrc" @add="popup.fun[0]" @cancle="popup.fun[1]" />
        <select-lyric-vue v-if="popup.index == popup.enum.selectLyric" :selected-lrcid="popup.data.selectLrcid" @select="popup.fun[0]" @cancle="popup.fun[1]" />
        <AddLyricVue v-if="popup.index == popup.enum.addlyric" @add="popup.fun[0]" @cancle="popup.fun[1]"  />
        <EditLyricInfoVue v-if="popup.index == popup.enum.editlyric" :lyric="popup.data.editLyric" @save="popup.fun[0]" @cancle="popup.fun[1]" />
        <AddScriptSrcVue v-if="popup.index == popup.enum.addScriptSrc" @add="popup.fun[0]" @cancle="popup.fun[1]" />
    </div>
</template>