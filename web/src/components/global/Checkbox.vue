<script setup lang="ts">
import { Global_store } from '../../stores/Global';

const global_s = Global_store();

const props = defineProps({
    checked:{
        type:Boolean
    }
})
//事件信号
const emits = defineEmits({
    'update:checked':null,
    'click':(event:any) => {
        if(event) {
            return true;
        } else {
            return true;
        }
    }
})

const checkbox_click = () => {
    let event = global_s.getTemp_event();
    emits('click', event);
    if(!event.isTodo()) {
        return;
    }
    emits('update:checked', !props.checked);
}

</script>

<template>
    <div class="cmusic_checkbox_toggle-button-cover">
        <div class="cmusic_checkbox_button-cover">
            <div class="cmusic_checkbox_button cmusic_checkbox_b2 cmusic_checkbox_setBg_button">
                <input type="checkbox" 
                    class="cmusic_checkbox_checkbox" 
                    @click="checkbox_click()"
                    :checked="props.checked" />
                <div class="cmusic_checkbox_knobs">
                    <span></span>
                </div>
                <div class="cmusic_checkbox_layer"></div>
            </div>
        </div>
    </div>
</template>

<style>
.cmusic_checkbox_toggle-button-cover {
    width: 80px;
    height: 40px;
    position: relative;
    box-sizing: border-box;
}
.cmusic_checkbox_button-cover {
    width: 30%;
    height: 40px;
    border-radius: 10px;
}
.cmusic_checkbox_button-cover:before {
    position: absolute;
    right: 0;
    bottom: 0;
    color: #d7e3e3;
    font-size: 12px;
    line-height: 1;
    padding: 5px;
}
.cmusic_checkbox_button-cover,
.cmusic_checkbox_knobs,
.cmusic_checkbox_layer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}
.cmusic_checkbox_button {
    position: relative;
    top: 50%;
    width: 74px;
    height: 36px;
    margin: -20px auto 0 auto;
    overflow: hidden;
}
.cmusic_checkbox_button.r,
.cmusic_checkbox_button.r .cmusic_checkbox_layer {
    border-radius: 100px;
}
.cmusic_checkbox_button.cmusic_checkbox_b2 {
    border-radius: 5px;
}
.cmusic_checkbox_checkbox {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 3;
}
.cmusic_checkbox_knobs {
    z-index: 2;
}
.cmusic_checkbox_layer {
    width: 100%;
    background-color: #ebf7fc;
    transition: 0.3s all;
    z-index: 1;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs:before,
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs:after,
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs span:before,
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs span:after {
    position: absolute;
    top: 4px;
    width: 20px;
    height: 10px;
    font-size: 12px;
    font-weight: bolder;
    text-align: center;
    line-height: 1;
    padding: 9px 4px;
    border-radius: 5px;
    transition: 0.3s all;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs:before,
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs:after {
    color: #4e4e4e;
    z-index: 1;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs:before {
    content: "\5173";  /*关的utf8*/
    left: 4px;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs:after {
    content: "\5F00";  /*开的utf8*/
    right: 4px;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs span {
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs span:before {
    left: 4px;
    top: -28px;
    background-color: #66ccff;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs span:after {
    top: 4px;
    left: 39px;
    background-color: #ebc2ce;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs span:before,
.cmusic_checkbox_setBg_button .cmusic_checkbox_knobs span:after {
    content: '';
    width: 23px;
    z-index: 2;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_checkbox:checked+.cmusic_checkbox_knobs span:before {
    top: 4px;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_checkbox:checked+.cmusic_checkbox_knobs span:after {
    top: -28px;
}
.cmusic_checkbox_setBg_button .cmusic_checkbox_checkbox:checked~.cmusic_checkbox_layer {
    background-color: #fff;
}
</style>