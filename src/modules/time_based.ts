let intervals: {[channel: string]: number[]} = { "_": [] }
export function interval(func: Function, ms: number = 0, fire_immediately: boolean = false, channel: string | null = "_", ...args: any[]) {
  if (fire_immediately) { func(...args) }
  let id = setInterval(func, ms, args)

  channel = (channel == null ? "_" : channel)
  if (intervals[channel] == null) { intervals[channel] = [] }
  intervals[channel].push(id)

  return id
}
export function clear_interval(id: number) {
  let channels = Object.keys(intervals)
  for (let index = 0; index < channels.length; index++) {
    let channel = channels[index]
    let ind = intervals[channel].indexOf(id)
    if (ind != null) {
      clearInterval(id)
      intervals[channel].splice(ind, 1)
    }
  }
}
export function clear_interval_channel(channel: string) {
  if (intervals[channel] == null) { return }

  intervals[channel].forEach(id => {
    clearInterval(id)
  })

  delete intervals[channel]
}

let timeouts: {[channel: string]: number[]} = { "_": [] }
export function timeout(func: Function, ms: number = 0, channel: string | null = "_", ...args: any[]) {
  let id = setTimeout(func, ms, args)

  channel = (channel == null ? "_" : channel)
  if (timeouts[channel] == null) { timeouts[channel] = [] }
  timeouts[channel].push(id)

  return id
}
export function clear_timeout(id: number) {
  let channels = Object.keys(timeouts)
  for (let index = 0; index < channels.length; index++) {
    let channel = channels[index]
    let ind = timeouts[channel].indexOf(id)
    if (ind != null) {
      clearTimeout(id)
      timeouts[channel].splice(ind, 1)
    }
  }
}
export function clear_timeout_channel(channel: string) {
  if (timeouts[channel] == null) { return }

  timeouts[channel].forEach(id => {
    clearTimeout(id)
  })

  delete timeouts[channel]
}

export function wait(ms: number = 0, channel: string | null = null) {
  return (new Promise<void>((res, rej) => {
    timeout(res, ms, channel)
  }))
}