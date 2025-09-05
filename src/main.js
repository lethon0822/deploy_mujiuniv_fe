import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import "@/assets/global.css"; //폰트

import App from "./App.vue";
import router from "./router";
import BootstrapVue3 from "bootstrap-vue-3";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import axios from 'axios'
// 프록시를 쓸 거라면 '/api' 권장
axios.defaults.baseURL = '/api'
axios.defaults.headers.common['Accept'] = 'application/json'


const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(BootstrapVue3);
app.use(pinia);

app.use(router);

app.mount("#app");
