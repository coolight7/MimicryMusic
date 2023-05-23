<script setup lang="ts">
import { reactive, toRefs } from "vue";
import { useRouter } from 'vue-router';
import { SrcIcon } from "../stores/Src";
import { ContainBar_store, MyRouterPostition_e } from '../stores/contain/ContainBar';

import { loadFull } from 'tsparticles';
import MyBtn from "../components/global/MyBtn.vue";
import MyHomeTip from "../components/global/MyHomeTip.vue";

const router = useRouter();
const download_click = () => {
    router.push({
        path:"/download"
    });
}

const particlesInit = async (engine: any) => {
  await loadFull(engine)
}

const particlesLoaded = async (container: any) => {
    
}

const containbar_s = ContainBar_store();
containbar_s.showPosition(MyRouterPostition_e.Home);

const data = reactive({
    options: {
        fpsLimit: 50,
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: "push",
                },
                onHover: {
                    enable: true,
                    mode: "grab",
                },
                resize: true,
            },
            modes: {
                bubble: {
                    distance: 400,
                    duration: 2,
                    opacity: 0.6,
                    size: 10,
                },
                push: {
                    quantity: 4,
                },
                repulse: {
                    distance: 200,
                    duration: 0.4,
                },
            },
        },
        particles: {
            color: {
                value: "#66ccff",
            },
            links: {
                color: "#66ccff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
            },
            collisions: {
                enable: true,
            },
            move: {
                direction: "none",
                enable: true,
                outMode: "bounce",
                random: false,
                speed: 2,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    value_area: 800,
                },
                value: 60,
            },
            opacity: {
                value: 0.5,
            },
            shape: {
                type: "circle",
            },
            size: {
                random: true,
                value: 3,   
            },
        },
        detectRetina: true,
    },
})
 
const { options } = toRefs(data);

</script>

<template>
    <div class="cmusic_displayFlexColumn_class" style="min-height: 400px;">
        <div class="cmusic_displayFlex_class cmusic_user_sign_button" 
            @click="download_click" 
            style="align-self: flex-start;justify-self: center;height: 60px;width: auto;align-items: center;">
            <MyBtn :icon="SrcIcon.mobile_d" :shadow="false" />
            <span class="cmusic_textMain_color" style="font-weight: bolder;">下载客户端</span>
            <MyBtn :icon="SrcIcon.desktop_d" :shadow="false" />
        </div>
        <div class="cmusic_displayFlex_class cmusic_user_sign_button" 
            style="align-self: flex-start;justify-self: center;height: 60px;width: auto;align-items: center;padding-left: 20px;padding-right: 20px;">
            <a href="https://blog.mimicry.cool/" target="_blank" class="cmusic_textMain_color">使用帮助</a>
        </div>
        <MyHomeTip style="margin-top: 50px;" />
        <Particles 
            id="tsparticles" 
            class="login-partic" 
            :particlesInit="particlesInit"
            :particlesLoaded="particlesLoaded"
            :options="options" />
    </div>
</template>
