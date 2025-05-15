import { SignupDialogue } from "@beepcomp/core";
import EventEmitter from "eventemitter3";
import { computed, inject, provide, Ref, ref } from "vue";
import { RemovableRef, useStorage } from '@vueuse/core'
export const DiscordAuth: RemovableRef<any> = useStorage("discord_token", {})

export const signupMode = ref(false)
export const SignUpMetadata: Ref<SignupDialogue[]> = ref([])

export const TerminalEvents = new EventEmitter()

export const DiscordAccess = computed(() => {
  return DiscordAuth.value?.access_token
})