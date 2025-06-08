import { onKeyStroke, useMousePressed } from '@vueuse/core'
import EventEmitter from 'eventemitter3'
import { watch } from 'vue'

export const KeyEvents = new EventEmitter()

onKeyStroke(['Enter'], (e) => {
  KeyEvents.emit("enter")
})

onKeyStroke(true, (e) => {
  KeyEvents.emit("any")
})


const { pressed } = useMousePressed()
watch(pressed, (v) => {
  if (v) {
    KeyEvents.emit("click")
  }
})