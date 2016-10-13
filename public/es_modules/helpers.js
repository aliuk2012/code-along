import {clear, ctx} from 'canvas'

// sync to parent window timing:
// pro - would look cool reloading maintained
// con - could be confusing for people who expect rAF

const timingOffset = () =>
  window.performance && window.parent.performance ?
    parent.performance.now() - performance.now() :
    0


export const loop = fn => {
  const off = timingOffset()

  const wrapped = t => {
    const r = requestAnimationFrame(wrapped)
    clear()
    try {
      fn(t + off)
    } catch (e) {
      window.cancelAnimationFrame(r)
      throw e
    }
  }
  requestAnimationFrame(wrapped)
}




export const drawEdge = ([a,b]) => {
  ctx.beginPath()
  ctx.moveTo(a.e(1), a.e(2))
  ctx.lineTo(b.e(1), b.e(2))
  ctx.stroke()
}

export const scale = s => $M([
  [s, 0, 0],
  [0, s, 0],
  [0, 0, s]
])

export const rotateX = theta => $M([
  [1,                0,               0],
  [0, Math.cos(theta), -Math.sin(theta)],
  [0, Math.sin(theta),  Math.cos(theta)],
])

export const rotateY = theta => $M([
  [Math.cos(theta), 0, -Math.sin(theta)],
  [0,               1,                0],
  [Math.sin(theta), 0,  Math.cos(theta)],
])

export const rotateZ = theta => $M([
  [Math.cos(theta), -Math.sin(theta), 0],
  [Math.sin(theta),  Math.cos(theta), 0],
  [0,                0,               1],
])
