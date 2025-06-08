import { SignupDialogue } from "@beepcomp/core";
import EventEmitter from "eventemitter3";
import { computed, inject, provide, Ref, ref } from "vue";
import { RemovableRef, useStorage } from '@vueuse/core'
import { timeout } from "./time_based";
export const DiscordAuth: RemovableRef<any> = useStorage("discord_token", {})
export const ParticipationCache: RemovableRef<any> = useStorage("already_participating", false)

export const isMobile = ref(false)

export const signupMode = ref(false)
export const SignUpMetadata: Ref<SignupDialogue[]> = ref([])
export const StartedUp: Ref<Boolean> = ref(false)

export const GeneralEvents = new EventEmitter()
export const TerminalEvents = new EventEmitter()

GeneralEvents.on("startup", () => {
  StartedUp.value = true
})

export const active_toasts: Ref<{id: number, text: string}[]> = ref([])
var toast_id = 0
export function Toast(text: string) {
  let this_id = toast_id
  toast_id += 1

  active_toasts.value.push({id: this_id, text})

  timeout(() => {
    killToast(this_id)
  }, 5000)
}
export function killToast(id: number) {
  let remove_idx = active_toasts.value.findIndex(entry => entry.id == id)
  if (remove_idx != -1) {
    active_toasts.value.splice(remove_idx, 1) // bye bye 
  }
}

export const DiscordAccess = computed(() => {
  return DiscordAuth.value?.access_token
})