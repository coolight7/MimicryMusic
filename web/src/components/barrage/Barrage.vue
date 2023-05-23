<script setup lang="ts">
import { Barrage_store } from '../../stores/barrage/Barrage';
import { ref, onMounted } from "vue"; // 引入全局

const barrage_s = Barrage_store();

const cmusic_barrage = <any>ref(null);

onMounted(() => {
    barrage_s.barrageDiv = cmusic_barrage;
});


</script>

<template>
    <div class="cmusic_barrage_div" ref="cmusic_barrage">
        
    </div>
</template>
