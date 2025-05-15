import { ref } from "vue";
import { lerp } from "./maths";

export const mousePos = ref({x: 0, y: 0})
export const lerppedMousePos = ref({x: 0, y: 0})

window.addEventListener("mousemove", (e: MouseEvent) => {
  mousePos.value.x = e.clientX
  mousePos.value.y = e.clientY
})

function lerpMouse() {
  lerppedMousePos.value.x = lerp(lerppedMousePos.value.x, mousePos.value.x, 0.05)
  lerppedMousePos.value.y = lerp(lerppedMousePos.value.y, mousePos.value.y, 0.05)

  requestAnimationFrame(lerpMouse)
}
lerpMouse()