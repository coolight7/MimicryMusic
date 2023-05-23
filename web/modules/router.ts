import { createRouter, createWebHistory } from "vue-router"
import routes from "~pages";

const router = createRouter({
    routes,
    history: createWebHistory()
})

export default router
