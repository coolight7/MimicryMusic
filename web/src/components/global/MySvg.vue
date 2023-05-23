<script setup lang="ts">
import { reactive, onMounted, watchEffect, watch } from 'vue';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    class: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: ''
    }
});

</script>

<template>
    <svg class="svg-icon">
        <use :xlink:href="'#' + props.name" :fill="props.color" />
    </svg>
</template>

<style>
.svg-icon {
    width: 24px;
    height: 24px;
    vertical-align: middle;
}
</style>