import EventEmitter from "eventemitter3";
import { API } from "./api";
import { SignUpMetadata, signupMode } from "./persists";
import { State } from "@beepcomp/core";

export const InitEvents = new EventEmitter()

API.GET("/state").then((state: State) => {
  print("state: ", state)

  if (state.started != true && state.signupMeta != null) {
    signupMode.value = true
    SignUpMetadata.value = state.signupMeta
    InitEvents.emit("signup_init", state.signupMeta)
  }
})