export const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

export const ctx = canvas.getContext('2d')

const ratio = window.devicePixelRatio || 1

export const w = canvas.width = window.innerWidth * ratio
export const h = canvas.height = window.innerHeight * ratio

ctx.translate(canvas.width/2,canvas.height/2)
ctx.scale(ratio,ratio)

canvas.style.width = `${window.innerWidth}px`
canvas.style.height = `${window.innerHeight}px`

export const clear = () =>
  ctx.clearRect(-w/2, -h/2, w, h)
