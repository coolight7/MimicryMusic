<script setup>
import { reactive } from 'vue';

let mValue = reactive({
    obj:{
        hello:"洛天依"
    },
})
const change = (in_obj) => {
    console.log("我们的change");
    mValue.obj = in_obj;
}

</script>

<template>
    <div>
        <span>span: {{mValue.obj.hello}}</span>
    </div>
</template>