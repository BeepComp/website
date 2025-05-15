export function wrap(v: number, a: number, b: number, offset = 0) {
  let min = Math.min(a, b)
  let max = Math.max(a, b)
  let diff = max - min
  return (v % (diff + offset)) + min
}

export function lerp( a: number, b: number, alpha: number ) {
	return (a + alpha * ( b - a ))
}