var canvas, ctx, w, h;

function getContext() {
  if(!canvas) {
    canvas = document.createElement('canvas')

    document.body.appendChild(canvas)

    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight


    ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
  }
  return ctx
}


export function circle(s){

  var ctx = getContext()
  ctx.beginPath()
  ctx.arc(w/2,h/2,(s||1) * Math.min(w,h)/2,0,2*Math.PI)
  ctx.fill()
}

export function square(){
  var ctx = getContext()
  ctx.fillRect(10,10,w-20,h-20)
}

export function arrow(){
  console.log("TODO: draw arrow")
}



const bodyElementStyle = document.body.style

export function background(color){
  bodyElementStyle.background = color
}
