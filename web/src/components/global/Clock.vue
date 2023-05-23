<script setup lang="ts">
import { ref, onMounted } from 'vue';
const secondHand = ref(null);
const minuteHand = ref(null);
const hourHand = ref(null);

let date = null;
let hour = 0;
let minute = 0;
let second = 0;

function handRotation(target:any, deg:number) {
    target.style.transform = `rotate(${deg}deg)`;
}
function clock() {
    date = new Date();
    let hour = (date.getHours() % 12) + date.getMinutes() / 59;
    let minute = date.getMinutes();
    let second = date.getSeconds();

    handRotation(hourHand.value, hour * 30);
    handRotation(minuteHand.value, minute * 6);
    handRotation(secondHand.value, second * 6);

    setTimeout(clock, 500);
}

onMounted(() => {
    clock();
})
</script>

<template>
    <div class="clock">
        <div class="inner-circle">
            <div class="hands">
                <div class="dots"></div>
                <div ref="hourHand" class="hand hour-hand"></div>
                <div ref="minuteHand" class="hand minute-hand"></div>
                <div ref="secondHand" class="hand second-hand"></div>
            </div>
        </div>
    </div>
</template>

<style>
:root {
    --bg-color: linear-gradient(158.53deg, #eef0f5 14.11%, #e2e4ea 85.89%);
    --clock-bg: linear-gradient(134.17deg, #e6e9ef 4.98%, #e6e9ef 4.99%, #eef0f5 94.88%);
    --clock-border: linear-gradient(170deg, #ffffff, #bac3cf);
    --clock-shadow: 19px 25px 92px -32px rgba(166, 180, 200, 0.45), -20px -20px 61px rgba(255, 255, 255, 0.53),
        13px 14px 12px -6px rgba(166, 180, 200, 0.57);
    --clock-inner-bg: linear-gradient(90deg, #eceef3 0%, #f1f2f7 100%);
    --clock-inner-shadow: inset -12px -12px 30px rgba(255, 255, 255, 0.2), inset 7px 7px 8px rgba(166, 180, 200, 0.52),
        inset 10px 11px 30px -1px rgba(166, 180, 200, 0.71);
    --hand-color: #646e82;
    --second-hand-color: #fd382d;
}


.clock {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-image: var(--clock-bg);
    box-shadow: var(--clock-shadow);
    position: relative;
}

/* 利用伪元素和padding实现border渐变效果 */
.clock::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: -1px;
    left: -1px;
    padding: 1px;
    border-radius: 50%;
    z-index: -1;
    background-image: var(--clock-border);
}

.inner-circle {
    width: 170px;
    height: 170px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-image: var(--clock-inner-bg);
    box-shadow: var(--clock-inner-shadow);
}

/* 表盘刻度 使用最少的元素实现四个刻度 */
.inner-circle::before,
.inner-circle::after {
    content: '';
    border-radius: 2px;
    background-color: rgba(166, 180, 200, 0.57);
    position: absolute;
}

.inner-circle::before {
    width: 2px;
    height: 10px;
    top: 4px;
    left: calc(50% - 1px);
    box-shadow: 0 152px rgba(166, 180, 200, 0.57);
}

.inner-circle::after {
    width: 10px;
    height: 2px;
    left: 4px;
    top: calc(50% - 1px);
    box-shadow: 152px 0 rgba(166, 180, 200, 0.57);
}

/* 表盘指针 */
.hands {
    width: 170px;
    height: 170px;
    position: relative;
}

.dots {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--hand-color);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
}

.dots::after {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--second-hand-color);
}

.hand {
    width: 3px;
    height: var(--hand-length);
    background-color: var(--hand-color);
    position: absolute;
    border-radius: 3px;
    left: calc(50% - 1.5px);
    top: var(--top);
    z-index: -1;
    transform-origin: center var(--origin-y);
}

.hour-hand {
    --hand-length: 60px;
    --top: 40px;
    --origin-y: 45px;
}

.minute-hand {
    --hand-length: 80px;
    --top: 24px;
    --origin-y: 61px;
}

.second-hand {
    --hand-length: 100px;
    --top: 15px;
    --origin-y: 70px;
    width: 2px;
    left: calc(50% - 1px);
    background-color: var(--second-hand-color);
    position: relative;
    z-index: 1;
}

.second-hand::after {
    content: '';
    width: 4px;
    height: 22px;
    background-color: var(--second-hand-color);
    position: absolute;
    bottom: -2px;
    border-radius: 2px;
    left: calc(50% - 2px);
}
</style>