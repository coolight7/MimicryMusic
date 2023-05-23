<script setup lang="ts">
import { storeToRefs }  from 'pinia';
import { ContainFunBar_store, FunItem_c } from "../../stores/contain/ContainFunBar"
import MySvg from "../global/MySvg.vue"

const contain_s = ContainFunBar_store();
const {
    isShow,
    funMap
} = storeToRefs(contain_s);

// contain_s.addItem("music", "hello coolight123", false, (item:[number, FunItem_c]) => {
//     console.log("hello coolight123");
//     contain_s.removeItem(item[0]);
// });
// contain_s.addItem("music", "hello coolight456",true, (item:[number, FunItem_c]) => {
//     console.log("hello coolight456");
//     contain_s.addItem("music", "hello coolight" + Math.random(), false, 
//         (item:[number, FunItem_c]) => {
//             console.log("hello coolight123");
//             contain_s.removeItem(item[0]);
//         }
//     );
// });
// contain_s.addItem("music", "hello coolight789", false, (item:[number, FunItem_c]) => {
//     item[1].isselected = !item[1].isselected;
// });

</script>

<template>
    <div v-if="isShow.detail" class="cmusic_containFunBar cmusic_displayFlexColumn_class">
        <transition-group name="contain_funbar_drag" class="cmusic_containFunBar_ul" tag="ul">
            <li v-for="(item, index) in funMap" :key="index" class="cmusic_containFunBar_li">
                <div class="cmusic_displayFlex_class" style="justify-content: flex-end;">
                    <span class="cwin_center cmusic_containFunBar_ul_span">{{item[1].text}}</span>
                    <button @click="item[1].clickFun(item)"
                        :class="['cmusic_containFunBar_ul_btn', 'cmusic_control_btn', {'cmusic_control_btn_selected':item[1].isselected}]">
                        <MySvg :name="item[1].iconName"/>
                    </button>
                </div>
            </li>
        </transition-group>
    </div>
</template>