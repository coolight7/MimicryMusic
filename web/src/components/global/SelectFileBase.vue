<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';

const props = defineProps({
    accept:{
        type:String,
        default:""
    },
    fontSize:{
        type:String,
        default:"large"
    },
    enable:{
        type:Boolean,
        default:true
    },
    text: {
        type:String,
        default:"选择文件"
    }
})

const emits = defineEmits({
    'change':(in_list) => {
        if(in_list) {
            return true;
        } else {
            console.warn("SelectFileImage.vue: 事件 'change' 未接收关键参数");
            return true;
        }
    }
})

let mValue = reactive({
    isShow:props.enable
})

const input_file = <any>ref(null);

const input_file_change = () => {
    emits('change', input_file.value.files);
}

onMounted(() => {
    watch(
        () => props.enable,
        (in_enable) => {
            mValue.isShow = in_enable;
        }
    )
})
</script>

<template>
    <div class="cmusic_selectFileBase">
        <slot class="cmusic_selectFileBase_solt"></slot>
        <div v-show="mValue.isShow" @click="input_file.click()" 
            class="cmusic_selectFileBase_hover">
            <input ref="input_file" 
                :accept="props.accept"
                @change="input_file_change()" 
                type="file" 
                style="display:none;" 
                multiple />
            <span :style="{ fontSize:props.fontSize }">{{ props.text }}</span>
        </div>
    </div>
</template>

<style>
.cmusic_selectFileBase {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
}
.cmusic_selectFileBase_solt {
    width: 100%;
    height: 100%;
}
.cmusic_selectFileBase_hover {
    cursor: pointer;
    width: 100%;
    height: 30%;
    position: absolute;
    align-self: self-end;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: rgba(221, 232, 252, 0.8);
}
.cmusic_selectFileBase_hover span {
    font-weight: bolder;
    color:#75738f;
}

</style>
