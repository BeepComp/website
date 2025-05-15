<script setup lang="ts">
import { computed, ComputedRef, DefineComponent, inject, onMounted, provide, ref, render, triggerRef, useTemplateRef, type Ref } from 'vue';
import { API } from '../../modules/api';
import { InitEvents } from '../../modules/init';
import { DiscordAccess, DiscordAuth, SignUpMetadata, signupMode, TerminalEvents } from '../../modules/persists';
import { CharObj, getLineChars, SignupButton, SignupDialogue } from '@beepcomp/core';

const _DiscordJustLoggedIn = ref(false)
provide("_DiscordJustLoggedIn", _DiscordJustLoggedIn)
const DiscordLoggedIn = computed(() => {
  return (_DiscordJustLoggedIn.value || DiscordAccess.value != null)
})
provide("DiscordLoggedIn", DiscordLoggedIn)

const CurrentDialogue: Ref<SignupDialogue | null> = ref(null)

const terminalVisible = ref(false)
const linesVisible = ref(true)
const buttonsVisible = ref(false)
const navVisible = ref(false)

onMounted(() => {
  if (SignUpMetadata.value.length == 0) {
    InitEvents.on("signup_init", (metadata: SignupDialogue[]) => {
      processMetadata()
    })
  } else {
    processMetadata()
  }
})

function processMetadata() {
  gotoDialogue("home")
}

const toggle = ref(0)

// document.addEventListener("mousedown", e => { toggle.value += 1; if (toggle.value == 4) { toggle.value = 0 } })

const linesContRef = useTemplateRef("signups-lines-cont")

const ButtonFilter: Ref<(button: SignupButton, index?: number) => boolean> = ref(() => true )
const ButtonIntercepts: Ref<{[index: string]: () => void}> = ref({
  withdraw_yes: async () => {
    print("I'm boss.")
    DiscordAuth.value = {}
    _DiscordJustLoggedIn.value = false
    gotoDialogue("home")
  }
})
async function gotoDialogue(id: string) {
  let thisDialogue = SignUpMetadata.value.find(entry => entry.id == id)

  ButtonFilter.value = () => true
  // Intercepts for various things
  switch (thisDialogue?.id) {
    case "home":
      ButtonFilter.value = (button) => {
        let res = true
        if (!DiscordLoggedIn.value && button.id == "home_withdraw") { res = false }
        if (DiscordLoggedIn.value && button.id == "home_signup") { res = false }
        return res
      }

      if (DiscordLoggedIn.value) {
        thisDialogue.lines = ["Welcome back! What are you looking to do?..."]
      }
    break;
    case "verify_identity":
      if (DiscordLoggedIn.value) {
        gotoDialogue("already_verified")
        return
      }
    break;
  }

  if (thisDialogue) {
    CurrentDialogue.value = thisDialogue

    renderedLines.value = []
    visibleLines.value = []
    renderedButtons.value = []

    terminalVisible.value = false
    navVisible.value = false

    // Lines
    if (thisDialogue.lines.length > 0) {
      await sayLine(thisDialogue.lines[0])
    }

    print("done printing lines??...")

    renderedButtons.value = thisDialogue.buttons

    let continue_action = thisDialogue.continue_action
    if (typeof continue_action == "string") {
      ContinueAction.value = () => interpretButtonAction(continue_action)
    }

    let continue_label = thisDialogue.continue_override
    if (typeof continue_label == "string") {
      ContinueLabel.value = continue_label
    }

    if (thisDialogue.terminal_id != null) {
      TerminalEvents.emit("terminal_opened_" + thisDialogue.terminal_id)
      terminalVisible.value = true
      navVisible.value = true

    } else if (thisDialogue.buttons.length > 0) {
      navVisible.value = false
    } else {
      navVisible.value = true
    }
  }
}

const renderedLines: Ref<CharObj[][][]> = ref([]) // lines => words => chars
const visibleLines: Ref<string[]> = ref([]) // lines => words => chars
// const renderingLineIdx = ref(-1)
async function sayLine(line: string) {
  clear_interval_channel("rendering_chars")

  return new Promise<void>(async (res, rej) => {
    let lineIdx = renderedLines.value.length
    let lastLine = ((renderedLines.value.length + 1) == CurrentDialogue.value?.lines.length)
    // visibleLines.value.push([[]]) // line with an empty word

    let words = getLineChars(line)
    renderedLines.value.push(words)
    let wordIdx = 0
    let charIdx = 0
    if (lastLine) { finished() }
    let lineInt = interval(() => {
      let adding_word = false
      // print(words[wordIdx].length, charIdx)
      if (charIdx == words[wordIdx].length) {
        adding_word = true
        wordIdx += 1
        charIdx = 0
      }
      if (wordIdx == words.length) {
        clear_interval(lineInt)
        if (!lastLine) { finished() }
      }
      // if (adding_word) { visibleLines.value[lineIdx].push([]) }

      visibleLines.value.push(`${lineIdx}-${wordIdx}-${charIdx}`)

      // let charElem = document.createElement("span")

      // charElem.className = "signup-lines-char-enter-active"
      // elem.appendChild(charElem)
      // charElem.outerHTML = lineCharHTML[charIdx].html

      charIdx += 1
    }, 40, true, "rendering_chars")

    async function finished() {
      if (!lastLine) {
        navVisible.value = true

        await (new Promise<void>((res, rej) => {
          setContinue(res)
        }))

        if (CurrentDialogue.value != null) {
          await sayLine(CurrentDialogue.value.lines[lineIdx+1])
        } else {
          print('idk man..')
        }
      }

      res()
    }
  })
}

const renderedButtons: Ref<SignupButton[]> = ref([])
function interpretButtonAction(action: string, id?: string) {
  if (id != null && Object.keys(ButtonIntercepts.value).includes(id)) {
    ButtonIntercepts.value[id]()
  } else {
    let foundDialogue = SignUpMetadata.value.find(entry => entry.id == action)
    if (foundDialogue != null) {
      gotoDialogue(action)
    } else {
      // go to url
    }
  }
}

import discord_terminal from "../terminals/discord.vue"
import { clear_interval, clear_interval_channel, interval, timeout, wait } from '../../modules/time_based';
const Terminals: any = {
  discord: discord_terminal
}
const CurrentTerminal: ComputedRef<DefineComponent | null> = computed(() => {
  if (CurrentDialogue.value?.terminal_id == null ) {
    return null
  } else {
    return Terminals[CurrentDialogue.value?.terminal_id]
  }
})

const ContinueLabel: Ref<string> = ref("CONTINUE")
const ContinueAction: Ref<() => void> = ref(() => null)
const CanContinue: Ref<boolean> = ref(true)
  provide("CanContinue", CanContinue)
function setContinue(func: () => void, label: string = "CONTINUE") {
  print("setting continue...", label, func)
  ContinueAction.value = func
  ContinueLabel.value = label
}

const frame = ref(0)
function advanceFrame() {
  frame.value += 1
  requestAnimationFrame(advanceFrame)
}
// advanceFrame()
</script>

<template>
<div id="signups" class="layer">
  <Transition name="cont">
    <div ref="signups-lines-cont" id="signups-lines-cont" class="signup-cont" v-show="linesVisible"> <!-- Lines Container -->
      <p v-for="(line, lineIdx) in renderedLines" class="rendered-line" :key="lineIdx">
        <p v-for="(word, wordIdx) in line" class="line-word" :key="wordIdx">
          <TransitionGroup name="char">
            <p v-for="(charObj, charIdx) in word" v-show="visibleLines.includes(`${lineIdx}-${wordIdx}-${charIdx}`)" v-html="charObj.html" class="line-char" :key="charIdx"></p>
          </TransitionGroup>
        </p>
      </p>
    </div>
  </Transition>
  <Transition name="cont">
    <div ref="signups-buttons-cont" id="signups-buttons-cont" class="signup-cont" v-show="renderedButtons.length > 0"> <!-- Button Container -->
      <button v-for="signupButton in renderedButtons.filter(ButtonFilter)" class="signup-button" :style="`--color: ${signupButton.color}`" @click="interpretButtonAction(signupButton.action, signupButton.id)">{{ signupButton.text }}</button>
    </div>
  </Transition>
  <Transition name="cont">
    <div ref="signups-terminal-cont" id="signups-terminal-cont" class="signup-cont" v-show="terminalVisible"> <!-- Terminal Container -->
      <div class="terminal-like" id="terminal-outer">
      <div class="terminal-like" id="terminal-middle">
        <div class="terminal-like" id="terminal">
          <component v-if="CurrentTerminal != null" :is="CurrentTerminal"></component>
        </div>
      </div>
      </div>
    </div>
  </Transition>
  <Transition name="cont">
    <div ref="signups-nav-cont" id="signups-nav-cont" class="signup-cont" v-show="navVisible"> <!-- Navigation Button Container -->
      <p id="continue-button" @click="e => {if (CanContinue) {ContinueAction()}}" :can-continue="CanContinue">{{ ContinueLabel }}</p>
    </div>
  </Transition>
</div>
</template>

<style scoped>
#signups {
  display: flex;
  flex-direction: column;
  gap: 15px;
  --padding: 30px;
  padding: var(--padding);
  width: calc(100vw - (var(--padding) * 2));
  height: calc(100vh - (var(--padding) * 2));
  transition: all 100ms cubic-bezier(0.215, 0.610, 0.355, 1);
}

.signup-cont {
  width: 100%;
  height: 100%;
  /* -webkit-backdrop-filter: opacity(1%); */
  /* background: none; */
}

.cont-enter-active {
  transition: height 0.4s cubic-bezier(0.33, 1, 0.68, 1); /* transition the transform/translate down and up- yeah... */
}
.cont-leave-active {
  transition: height 0.4s cubic-bezier(0.33, 1, 0.68, 1);
}

.cont-enter-from,
.cont-leave-to {
  height: 0% !important;
}

#signups-lines-cont {
  /* background: rgb(255 0 0 / 10%);  */
  display: flex;  
  flex-direction: column;
  justify-content: center;
  align-content: center;
  gap: 50px;
  --padding: 60px;
  width: calc(100% - (var(--padding) * 2));
  padding-left: var(--padding);
  padding-right: var(--padding);
}

.rendered-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-family: BakbakOne;
  color: white;
  font-size: 48px;
  text-align: center;
  margin: 0px;
  opacity: 0.1;
  gap: 15px;
  transition: opacity 0.5 ease;
}

.rendered-line:last-child {
  opacity: 1.0;
}

.line-word {
  display: flex;
  /* flex-wrap: wrap;
  justify-content: center; */
  margin: 0px;
  transition: 1.0s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-property: transform;
}

.word-move,
.word-enter-active,
.word-leave-active {
  transition: 1.0s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-property: transform;
}
.word-enter-from,
.word-leave-to {
  transition: 1.0s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-property: transform;
}
.word-leave-to,
.word-leave-active {
  display: none;
}

.line-char {
  /* display: inline-block; */
  white-space: break-spaces;
  margin: 0px;
  /* transform: translateY(0px); */
  top: 0px;
  transition: 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-property: opacity, top;
}

.char-move,
.char-enter-active,
.char-leave-active {
  position: relative;
  /* transition: opacity 0.1s cubic-bezier(0.33, 1, 0.68, 1); */
}
.char-enter-from,
.char-leave-to {
  /* transform: translateY(15px); */
  opacity: 0;
  top: 15px;
}
.char-leave-to,
.char-leave-active {
  display: none;
}


#signups-buttons-cont {
  display: flex;
  flex-direction: column;
  gap: 35px;
  --padding: 200px;
  padding-left: var(--padding);
  padding-right: var(--padding);
  width: calc(100% - (var(--padding) * 2));
}

#signups-terminal-cont {
  /* background: rgb(0 255 0 / 10%); */
}

.terminal-like {
  /* position: absolute; */
  --border-radius: 80px;
}

#terminal-outer {
  z-index: 8;
  --margin: 15px;
  --border-width: 0px;
  margin: var(--margin);
  padding: var(--margin);
  /* width: 100%; */
  width: calc(100% - (var(--margin) * 4));
  /* height: 100%; */
  height: calc(100% - (var(--margin) * 4));
  background: #7744ff;
  border-radius: calc(var(--border-radius) - (var(--margin) * 0));
}

#terminal-middle {
  z-index: 9;
  /* --margin: 20px; */
  /* --border-width: 0px; */
  /* margin: var(--margin); */
  padding: var(--margin);
  /* width: 100%; */
  width: calc(100% - (var(--margin) * 2));
  /* height: 100%; */
  height: calc(100% - (var(--margin) * 2));
  background: #000;
  border-radius: calc(var(--border-radius) - (var(--margin) * 1));
}

#terminal {
  z-index: 10;
  width: 100%;
  height: 100%;
  background: #151515;
  border-radius: calc(var(--border-radius) - (var(--margin) * 2));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#signups-nav-cont {
  height: 120px;
  background: rgb(0 0 255 / 10%);
}

#continue-button {
  font-family: BakbakOne;
  font-size: 32px;
  color: white;
  margin: 0px;
}
#continue-button[can-continue=false] {
  opacity: 0.1;
}
</style>