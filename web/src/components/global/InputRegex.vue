<script setup lang="ts">
import { reactive, onMounted, watch } from "vue";
const props = defineProps({
    str:{
        type:String,
        required:true
    },
    enable:{        //启用编辑
        type:Boolean,
        default:true
    },
    type:{
        type:String,
        default:"text"
    },
    isRight:{
        type:Boolean,
        default:false
    },
    regex:{
        type:RegExp,
        default:new RegExp("")
    },
    placeStr: {
        type:String,
    },
    tColor:{
        type:String,
        default:"#66ccff"
    },
    fColor:{
        type:String,
        default:"red"
    }
});

const emits = defineEmits({
    'enter':null,
    'update:str':null,
    'update:is-right':null
});

let mValue = reactive({
    regex:props.regex,
    str: props.str,
    type:props.type,
    inp_style:{
        color:props.tColor
    }
});
//检查正则是否匹配
function check_change () {
    let isRight = mValue.regex.test(mValue.str);
    if(isRight) {
        mValue.inp_style.color = props.tColor;
    } else {
        mValue.inp_style.color = props.fColor;
    }
    emits('update:is-right', isRight);
}
//更新输入值并检查正则
function input_change () {
    emits('update:str', mValue.str);
    check_change();
}
function input_keydown(this:any, event:any) {
    if(event.keyCode == 13) {
        emits('enter');
    }
}

const update_str = (in_str:string) => {
    mValue.str = in_str;
    check_change();
}
const update_regex = (in_regex:RegExp) => {
    mValue.regex = in_regex;
    check_change();
}
const update_type = (in_type:string) => {
    mValue.type = in_type;
}

update_str(props.str);

onMounted(() => {
    //同步监听props.str的变化
    watch(() => props.str,
        (str:string) => {
            update_str(str);
        }
    )
    watch(() => props.regex,
        (regex:RegExp) => {
            update_regex(regex);
        }
    )
    watch(() => props.type,
        (in_type) => {
            update_type(in_type);
        }
    )
})

</script>

<template>
    <input :class="(props.enable)?'cmusic_user_sign_div_input':'cmusic_inputRegex_disabled'" 
        v-model="mValue.str" 
        :placeholder="(true == props.enable) ? props.placeStr : ''"
        :type="mValue.type" 
        :style="mValue.inp_style"
        :disabled=!props.enable
        @input="input_change()"
        @keydown="input_keydown($event)" />
</template>

<style>
.cmusic_inputRegex_disabled {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 10px;
    width: 70%;
    height: 40px;
    background: none;
    outline: none;
    border: none;
    border-radius: 30px;
    padding-left: 15px;
    color: #66ccff;
    font-size: 18px;
}
</style>
