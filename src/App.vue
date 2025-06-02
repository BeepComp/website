<script setup lang="ts">
import Dashboard from './components/layers/Dashboard.vue';
import Popups from './components/layers/Popups.vue';
import SignUps from './components/layers/SignUps.vue';
import Background from './components/layers/Background.vue';
import Spinner from './components/layers/Spinner.vue';

import { API } from './modules/api';
import { active_toasts, killToast, signupMode } from './modules/persists';
import { loadingThings } from './modules/init';

// loadingThings.value["test"] = true

API.GET("/").then((response) => {
    console.log(response);
}).catch((error) => {
    console.error("Error fetching API:", error);
});
</script>

<template>
<div id="toast-container">
  <TransitionGroup name="toasts">
  <div v-for="entry in active_toasts" class="toast" :key="entry.id" @click="killToast(entry.id)">
    <p>{{ entry.text }}</p>
  </div>
  </TransitionGroup>
</div>
<Transition name="spinner">
    <Spinner class="spinner" v-if="Object.values(loadingThings).some(bool => {return bool})" /> <!-- LoadingSpinner -->
</Transition>
<Popups v-if="false" /> <!-- Popups -->
<Dashboard v-if="false"/> <!-- Main -->
<SignUps v-if="signupMode"/> <!-- SignUps -->
<Background/> <!-- Background -->
</template>

<style scoped>
#toast-container {
  z-index: 500;
  position: absolute;
  top: 30px;
  right: 30px;
  width: 640px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  pointer-events: none;
}

.toast {
  color: white;
  font-family: BakbakOne;
  font-size: 38px;
  color: white;
  background: #7744ff;
  border-radius: 15px;
  --padding: 15px;
  padding: var(--padding);
  width: calc(100% - (var(--padding) * 2));
  /* height: calc(80px - (var(--padding) * 2)); */
  pointer-events: all;
}

.toast > p {
  margin: 0px;
}

.toasts-move, /* apply transition to moving elements */
.toasts-enter-active,
.toasts-leave-active {
  transition: all 0.5s ease;
}

.toasts-enter-from,
.toasts-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.toasts-leave-active {
  position: absolute;
}

.spinner {
    opacity: 1.0;
    transition: opacity 200ms ease-in-out;
}

.spinner-enter-active,
.spinner-leave-active {
  opacity: 1.0;
}

.spinner-enter-from,
.spinner-leave-to {
  opacity: 0.0;
}
</style>
