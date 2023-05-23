<script setup lang="ts">
import { reactive } from "vue";
import { Song_store } from "../../stores/playList/Song";
import ScriptEditVue from "../../components/myscript/ScriptEdit.vue"
import { MyScript_c } from "../../stores/myscript/MyScript";

const song_s = Song_store();

let mValue = reactive({
    scriptObj:new MyScript_c()
})


</script>

<template>
    <div class="cmusic_displayFlexColumn_class">
        <span style="color: #75738f;font-weight: bolder;">T E S T</span>
        <div class="cmusic_displayFlexColumn_class" style="height:300px">
            <ScriptEditVue 
                :script-obj="<MyScript_c>(mValue.scriptObj)"
                style="height:100%"
                >
            </ScriptEditVue>
        </div>
    </div>
</template>