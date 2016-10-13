export const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

export const ctx = canvas.getContext('2d')

const ratio = window.devicePixelRatio || 1

export const w = canvas.width = window.innerWidth * ratio
export const h = canvas.height = window.innerHeight * ratio

canvas.style.width = `${window.innerWidth}px`
canvas.style.height = `${window.innerHeight}px`

ctx.translate(Math.floor(w/2),Math.floor(h/2))
ctx.scale(ratio,ratio)

export const clear = () =>
  ctx.clearRect(-w/2, -h/2, w, h)
