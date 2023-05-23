/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />
declare module "*.vue" {
    import { defineComponent } from "vue";
    const Component: ReturnType<typeof defineComponent>;
    export default Component;
}