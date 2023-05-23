<script setup lang="ts">
import { ref, reactive } from 'vue';

//事件信号
const emits = defineEmits({
    'change' :(in_files) => {
        if(in_files) {
            return true;
        } else {
            console.warn("SelectInput.vue: 事件'change'所绑定的处理函数未接收关键参数");
            return true;
        }
    },
})

let mValue = reactive({
    fileList:[],
})

const input_file = <any>ref(null);

const input_file_change = () => {
    console.log(input_file.value.files);
    mValue.fileList = input_file.value.files;
}
const span_click = () => {
    input_file.value.click();
}

</script>

<template>
    <div class="cmusic_displayFlexColumn_class cmusic_inputFile_div">
        <button @click="span_click()" class="cmusic_control_btn" style="width:auto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18.4,7.379a1.128,1.128,0,0,1-.769-.754h0a8,8,0,1,0-15.1,5.237A1.046,1.046,0,0,1,2.223,13.1,5.5,5.5,0,0,0,.057,18.3,5.622,5.622,0,0,0,5.683,23H11a1,1,0,0,0,1-1h0a1,1,0,0,0-1-1H5.683a3.614,3.614,0,0,1-3.646-2.981,3.456,3.456,0,0,1,1.376-3.313A3.021,3.021,0,0,0,4.4,11.141a6.113,6.113,0,0,1-.073-4.126A5.956,5.956,0,0,1,9.215,3.05,6.109,6.109,0,0,1,9.987,3a5.984,5.984,0,0,1,5.756,4.28,2.977,2.977,0,0,0,2.01,1.99,5.934,5.934,0,0,1,.778,11.09.976.976,0,0,0-.531.888h0a.988.988,0,0,0,1.388.915c4.134-1.987,6.38-7.214,2.88-12.264A6.935,6.935,0,0,0,18.4,7.379Z"/>
                <path d="M18.707,16.707a1,1,0,0,0,0-1.414l-1.586-1.586a3,3,0,0,0-4.242,0l-1.586,1.586a1,1,0,0,0,1.414,1.414L14,15.414V23a1,1,0,0,0,2,0V15.414l1.293,1.293a1,1,0,0,0,1.414,0Z"/>
            </svg>
            <span>点击选择文件或文件夹</span>
        </button>
        <span>可拖动到框内</span>
        <input ref="input_file" @change="input_file_change()" type="file" style="display:none;" multiple/>
    </div>
</template>

<style>
.cmusic_inputFile_div {
    width: 500px;
    height: 300px;
    border-radius: 20px;
    border: 1px solid #66ccff;
}
.cmusic_inputFile_div span {
    color:#66ccff;
    font-size: larger;
    font-weight: bold;
}

</style>
