<script setup lang="ts">
import Dashboard from './components/layers/Dashboard.vue';
import Popups from './components/layers/Popups.vue';
import SignUps from './components/layers/SignUps.vue';
import Background from './components/layers/Background.vue';
import { API } from './modules/api';
import { signupMode } from './modules/persists';

API.GET("/").then((response) => {
    console.log(response);
}).catch((error) => {
    console.error("Error fetching API:", error);
});

</script>

<template>
<Popups v-if="false" /> <!-- Popups -->
<Dashboard v-if="false"/> <!-- Main -->
<SignUps v-if="signupMode"/> <!-- SignUps -->
<Background/> <!-- Background -->
</template>

<style scoped>

</style>
