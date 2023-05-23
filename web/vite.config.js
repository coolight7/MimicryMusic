import { defineConfig } from "vite"
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import Vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import electron from "vite-plugin-electron";

let isEletron = false;

let myPlugins = [
    Vue(),
    Pages(),
    createSvgIconsPlugin({
        // 指定要缓存的文件夹
        iconDirs: [resolve(process.cwd(), 'src/images/icon/svg')],
        // 指定symbolId格式
        symbolId: '[name]'
    })
];

if(isEletron) {     //electron
    myPlugins.push(electron({
        main:{
            entry:"electron/index.ts"
        }
    }))
}

export default defineConfig((command, mode) => {
    return {
        plugins:myPlugins,
        server: {
            proxy: {
                "/api/":{
                    target:"http://127.0.0.1:80/",
                    changeOrigin: true,
                }
            }
        }
    }
})
