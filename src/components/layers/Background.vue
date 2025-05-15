<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { lerppedMousePos } from '../../modules/mouse';
import { lerp } from '../../modules/maths';
import { clear_interval, clear_interval_channel, clear_timeout_channel, interval } from '../../modules/time_based';


const canvasRef = useTemplateRef('canvas');

let timeouts: number[] = []
let intervals: number[] = []
let currentColCount: number = 0;
let currentRowCount: number = 0;
let lineInfo: number[][] = []
let gettingBrighter: boolean[][] = []
let currentId: number = 0;
function setup() {
  const canvas = (canvasRef.value as HTMLCanvasElement)
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  frame = 0
  last = -1
  squares = []

  clear_timeout_channel("background")
  clear_interval_channel("background")

  currentId = Date.now()
  animateBackground(performance.now(), currentId);

  lineInfo = []
  gettingBrighter = []
  for (let i = 0; i < currentColCount; i++) {
    lineInfo[i] = new Array(currentRowCount)
    gettingBrighter[i] = new Array(currentRowCount)
    for (let o = 0; o < currentRowCount; o++) {
      lineInfo[i][o] = 0
      gettingBrighter[i][o] = false
    }
  }

  interval(sendLine, 0, true, "background")
}

onMounted(() => {
  setup()
  window.addEventListener('resize', () => {
    setup()
    // animateBackground(canvas);
  })
})

let frame = 0
let last: number = -1;
let squares: OffscreenCanvas[] = []
function animateBackground(timestamp: number, this_id: number) {
  if (currentId != this_id) { return }
  const canvas = (canvasRef.value as HTMLCanvasElement)
  const ctx = canvas.getContext('2d')

  const DELTA = 16
  const elapsed = (last == -1 ? 0 : timestamp - last);
  // console.log(last, elapsed)
  frame += (elapsed / DELTA)
  last = timestamp

  if (ctx == null) { return null }

  const idealGap: number = 5;
  const idealSize: number = 30;
  const squareRadius: number = 2;
  let rowMargin: number = -100;

  let squareSize = idealSize
  let gap = idealGap
  let square_count = Math.ceil((canvas.width - gap) / (squareSize + gap)) + 1

  let colCount = (square_count + 2)
  currentColCount = colCount
  // console.log("colCount: ", colCount)
  let rowCount = Math.ceil((canvas.height - gap - (rowMargin * 2)) / (squareSize + gap))
  currentRowCount = rowCount
  // console.log("rowCount: ", rowCount)

  // let x_offset = (-(squareSize / 2)) - wrap(frame, 0, squareSize, gap)
  let x_offset = (-(squareSize / 2)) - (((lerppedMousePos.value.x - (canvas.width / 2)) / canvas.width) * 100)
  // console.log("x_offset: ", x_offset)
  // let y_offset = (squareSize / 2) - (((canvas.height / 2) - rowMargin) - (rowCount * (squareSize + gap)) - gap)
  // let y_offset = (squareSize / 2)
  let y_offset = ((canvas.height - (((rowCount - 1) * (squareSize + gap)) + squareSize)) / 2) - (((lerppedMousePos.value.y - (canvas.height / 2)) / canvas.height) * 100)
  // console.log("y_offset: ", y_offset)
  
  // let squares: OffscreenCanvas[] = []
  const total_squares = 20

  if (squares.length == 0) {
    for (let i = 0; i < total_squares; i++) {
      let square_canvas = new OffscreenCanvas(squareSize, squareSize)
      let square_canvas_ctx = square_canvas.getContext("2d")
      if (square_canvas_ctx) {
        const MAX_ALPHA = 0.03
        const MIN_ALPHA = 0.006

        let alpha_diff = Math.abs(MAX_ALPHA - MIN_ALPHA)

        let alpha = ((i / total_squares) * alpha_diff) + MIN_ALPHA
        // console.log(i, ": ", alpha)
        square_canvas_ctx.fillStyle = `rgb(255 255 255 / ${alpha})`
        // square_canvas_ctx.fillStyle = `rgb(255, 255, 255 / )`
        square_canvas_ctx.roundRect(
          0,
          0,
          squareSize,
          squareSize,
          squareRadius,
        ) 
        square_canvas_ctx.fill()
      }

      squares.push(square_canvas)
    }
  }
  

  ctx.clearRect(0,0,canvas.width,canvas.height)

  for (let x = 0; x < colCount; x++) {
    for (let y = 0; y < rowCount; y++) {

      if (lineInfo.length > 0) {
        if (gettingBrighter[x][y] == true) {
          if (Math.abs(19 - lineInfo[x][y]) > 0.1) {
            lineInfo[x][y] = lerp(lineInfo[x][y], 19, 0.3)
          } else {
            gettingBrighter[x][y] = false
          }
        } else {
          lineInfo[x][y] = lerp(lineInfo[x][y], 0, 0.07)
        }
      }

      let thisSquare = squares[(lineInfo.length > 0 ? Math.round(lineInfo[x][y]) : 0)]
      if (thisSquare == null) {return}
      ctx.drawImage(
        thisSquare,
        ((x * (squareSize + gap)) + x_offset) - (squareSize + gap),
        (y * (squareSize + gap) + y_offset)
      )
    }
  }

  // console.log(currentId, " [currentId]")
  // console.log(this_id, " [this_id]")
  if (currentId == this_id) {
    requestAnimationFrame(timestamp => animateBackground(timestamp, currentId))
  }
}

function randi(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendLine() {
  if (randi(0, 7) != 5) { return }
  let col = randi(0, currentColCount)

  let curr_idx = 0
  let this_id = interval(() => {
    // console.log(gettingBrighter)
    if (gettingBrighter[col] ==undefined || gettingBrighter[col][curr_idx] == undefined) { return }
    gettingBrighter[col][curr_idx] = true
    curr_idx += 1
    if (curr_idx >= currentRowCount) {
      clear_interval(this_id)
    }
  }, 60, true, "background")
}

</script>

<template>
<canvas ref="canvas" id="background" class="background layer"></canvas>
</template>

<style scoped>
#background {
  pointer-events: none;
  z-index: -1;
}
</style>
