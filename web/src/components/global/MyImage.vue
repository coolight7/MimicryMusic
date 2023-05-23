<script setup lang="ts">
import MySvg from "./MySvg.vue"
import { reactive, onMounted, watch } from "vue";
import { MySrcInfo_c, MySrcType_e, MySrc_c } from "../../util/MySrc";
import { Url_store } from "../../stores/Url";
import { Src_store } from "../../stores/Src";

const url_s = Url_store();
const src_s = Src_store();

const props = defineProps({
    src: {
        type: MySrc_c<MySrcInfo_c>,
        required: true,
    },
    errSrc: {
        type: String,
        required: false,
    }
});

let mValue = reactive({
    src:"",
    errSrc: "this.src='" + (props.errSrc ?? src_s.img.default_song) + "'"
});

const updateSrc = function() {
    switch(props.src.info.type) {
        case MySrcType_e.Bili:
            break;
            // TODO: 禁用bili
            mValue.src = url_s.proxy.bili.src + "?url=" + props.src.src;
            break;
        case MySrcType_e.Asset:
        case MySrcType_e.UrlLink:
        case MySrcType_e.MyLink:
        case MySrcType_e.MyCos:
            mValue.src = props.src.src;
            break;
        case MySrcType_e.Local:
        case MySrcType_e.LocalCache:
        case MySrcType_e.MyId:
        case MySrcType_e.Undefined:
            mValue.src = props.src.src;
            break;
    }
};

updateSrc();

onMounted(() => {
    watch(
        () => props.src,
        updateSrc
    )
});

</script>

<template>
    <img :src="mValue.src" :onerror = "mValue.errSrc" style="object-fit: cover;" loading="lazy">
</template>