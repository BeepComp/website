import "./extends/print"

import { createApp, ref, inject } from 'vue';
import './style.css'
import App from './App.vue'

export const app = createApp(App)

let accessRefreshKey = ref(0)
app.provide("accessRefreshKey", accessRefreshKey)

app.mount('#app')
