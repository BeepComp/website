import EventEmitter from "eventemitter3";
import { API } from "./api";
import { SignUpMetadata, signupMode } from "./persists";
import { State } from "@beepcomp/core";
import { Ref, ref } from "vue";

export const InitEvents = new EventEmitter()
export const isParticipant = ref(false)

export const LastState: Ref<State> = ref({
  serverTime: 0,
  started: false
})
export async function refreshState() {
  let state: State = await API.GET("/state")

  print("state: ", state)

  LastState.value = state
  
  isParticipant.value = (state.user?.participant || false)

  if (state.started != true && state.signupMeta != null) {
    signupMode.value = true
    SignUpMetadata.value = state.signupMeta
    InitEvents.emit("signup_init", state.signupMeta)
  }
}

refreshState()