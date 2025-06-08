import "./extends/print"
import "./extends/string"

import "./modules/keys"

import VueMobileDetection from "vue-mobile-detection";

import { createApp, ref, inject } from 'vue';
import './style.css'
import App from './App.vue'
import { isMobile } from "./modules/persists";


export const app = createApp(App)
app.use(VueMobileDetection);

let accessRefreshKey = ref(0)
app.provide("accessRefreshKey", accessRefreshKey)

function mobileCheck() {
  isMobile.value = (app.config.globalProperties as any).$isMobile()
  if (isMobile.value) {
    document.body.style.setProperty("--is-mobile", "1")
    document.body.style.setProperty("--scr-width", (window.innerWidth * 2) + "px")
    document.body.style.setProperty("--scr-height", (window.innerHeight * 2) + "px")
    document.body.style.setProperty("zoom", "0.5")
    document.body.style.setProperty("display", "standalone")
    // window.scrollTo(0, 1);
  } else {
    document.body.style.setProperty("--is-mobile", "0")
    document.body.style.setProperty("--scr-width", "100vw")
    document.body.style.setProperty("--scr-height", "100vh")
    document.body.style.setProperty("zoom", "1.0")
    document.body.style.removeProperty("display")
  }

  // print("css: ", document.body.style)
}
mobileCheck()
window.addEventListener("DOMContentLoaded", e => {
  mobileCheck()
})
window.addEventListener("resize", e => {
  mobileCheck()
})

app.mount('#app')