<script setup lang="ts">
import { onMounted, reactive, watch } from "vue";
import { MySrcInfo_c, MySrcType_e, MySrc_c } from '../../util/MySrc';
import MyImage from './MyImage.vue';
import SelectFileBaseVue from './SelectFileBase.vue';

const props = defineProps({
    src:{
        type:MySrc_c<MySrcInfo_c>,
        required: true,
    },
    accept:{
        type:String,
        default:".jpg,.jpeg,.png"
    },
    fontSize:{
        type:String,
        default:"large"
    },
    enable:{
        type:Boolean,
        default:true
    },
    errSrc:{
        type:String,
        required: false,
    },
})

let mValue = reactive({
    src: props.src.copyWith(),
})

const emits = defineEmits({
    'change':(in_list:string) => {
        if(in_list) {
            return true;
        } else {
            console.warn("SelectFileImage.vue: 事件 'change' 未接收关键参数");
            return true;
        }
    }
})

const img_change = (in_list:any) => {
    if(in_list.length > 0) {
        let file = in_list[0];
        let reader = new FileReader();
        reader.onload = function() {
            const reStr = this.result?.toString();
            if(reStr) {
                emits('change', reStr);
            }
        }
        reader.readAsDataURL(file);
    }
}

const update_src = (src:MySrc_c<MySrcInfo_c>) => {
    mValue.src = src;
} 

onMounted(() => {
    watch(
        () => props.src,
        update_src,
    )
})

</script>

<template>
    <div style="overflow: hidden;border-radius: 50%;">
        <SelectFileBaseVue 
            text="更换"
            @change="img_change" 
            :accept="props.accept"
            :font-size="props.fontSize"
            :enable="props.enable" >
            <MyImage :src="mValue.src" :err-src="props.errSrc" />
        </SelectFileBaseVue>
    </div>
</template>

