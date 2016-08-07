export function debug(){
  document.currentScript.className = 'visible'
}

export function background(color){
  document.body.style.backgroundColor = color
}

export function text(text){
  document.getElementById('content').innerText = text
}

export function html(html){
  document.getElementById('content').innerHTML = html
}

export function css(css){
  document.getElementById('user-css').innerHTML = css
}
