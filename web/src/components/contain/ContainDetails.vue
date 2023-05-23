<script setup lang="ts">
import PlayListDetailsVue from '../playList/PlayListDetails.vue';
import SettingVue from '../setting/Setting.vue';
import UserDetailsVue from '../user/UserDetails.vue';
import SearchDetailsVue from '../search/SearchDetails.vue';

import { storeToRefs }  from 'pinia';
import { ContainTopBar_store } from '../../stores/contain/ContainTopBar';
import { ContainBar_store } from '../../stores/contain/ContainBar';
import { Style_store } from '../../stores/Style';

const containTopBar_s = ContainTopBar_store();
const containbar_s = ContainBar_store();

const {
    cmusic_containContent_style,
} = storeToRefs(Style_store());

</script>


<template>
    <div class="cmusic_displayFlex_class" >
        <div class="cmusic_contain cmusic_displayFlexColumn_class">
            <div class="cmusic_displayFlexColumn_class cwin_center" 
                :style="cmusic_containContent_style">
                <play-list-details-vue 
                    v-show="containbar_s.isShow.position_index == 1" 
                    style="height:500px;"/>
                <user-details-vue   
                    v-show="containbar_s.isShow.position_index == 2"/>
                <setting-vue        
                    v-show="containbar_s.isShow.position_index == 3" />
                <search-details-vue 
                    v-show="containTopBar_s.isShow.position_index == 0"/>
            </div>
        </div>
    </div>
</template>
