import { createApp } from 'vue'
import AppVue from './App.vue'

import router from "./modules/router"
import pinia from "./modules/pinia"
import 'virtual:svg-icons-register'

import Particles from "particles.vue3";

const coolApp = createApp(AppVue);
coolApp.use(pinia);
coolApp.use(router);
coolApp.use(Particles);
coolApp.mount('#mymusic');
