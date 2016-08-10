var source = document.createElement('textarea')
var target = document.createElement('iframe')

document.body.appendChild(source)
document.body.appendChild(target)

source.onkeyup = function(){
  target.src = 'data:text/html;charset=utf-8,' +
    encodeURI('<body><scr'+'ipt>'+source.value+'</scr'+'ipt>')
}






document.body.innerText = 'Hello World!'
document.body.style.backgroundColor = 'pink'








import {set, getAll} from 'store'

input('color', (value)=>{
  set('color', value)
})

function input(name, callback){

}

var inp = document.createElement('input')
inp.type = 'color'
document.body.appendChild(inp)

inp.addEventListener('change', function(){
  if(this.value)
    set('color', this.value)
})

var out = document.createElement('div')
document.body.appendChild(out)

setInterval(function(){
  out.innerText = getAll('color').join(',')

}, 1000)






// Colour club

import {setItem, getItem, getItems, subItem, subItems} from 'store'

document.body.style.background = '#fff'

var input = document.createElement('input')
document.body.appendChild(input)

input.style.margin = '5em'
input.style.fontSize = '1em'
input.type = 'color'

input.addEventListener('change', function(){
  setItem('color', this.value)
  console.log(this.value)
}, false)

var output = document.createElement('div')
document.body.appendChild(output)

subItem('color', (c) => {
  document.body.style.background = c
})

subItems('color', (cs) => {
  console.log("SADFO",cs);
  output.innerText = cs.join(' + ')
})









import {setItem, getItem, getItems, subItem, subItems} from 'store'

document.body.style.background = '#fff'

var input = document.createElement('input')
document.body.appendChild(input)

input.style.margin = '5em'
input.style.fontSize = '1em'
input.type = 'color'

input.addEventListener('change', function(){
  setItem('c', this.value)
  console.log(this.value)
}, false)

var output = document.createElement('div')
document.body.appendChild(output)

subItem('c', (c) => {
  document.body.style.background = c
})

subItems('c', (cs) => {
  output.innerHTML = ''
  cs.forEach(c => {
    var d = document.createElement('div')
    d.style.backgroundColor = c
    d.style.display = 'inline-block'
    d.style.margin = '.2em'
    d.style.padding = '2em'
    d.style.borderRadius = '100%'
    output.appendChild(d)
  })
})










// EXAMPLES


// SSE

var source = new EventSource("script.php")
source.onmessage = function(event) {
    document.getElementById("result").innerHTML += event.data + "<br>"
}

//
//
//
// ws://echo.websocket.org/





const source = new EventSource("/endpoint.php");

source.onmessage = e => console.log(`message: ${e.data}`)

/*
:comment

data: Hello

:comment

data: Hello
data: World
*/


source.addEventListener('dial') = e => console.log(`Dial position: ${e.data}`)

/*
event: dial
data: 54

event: dial
data: 108

event: keypad
data: f

event: button-a
data: pressed
*/


// also


/*
event: dial
data: 54
id: 0001

event: dial
data: 108
id: 0002

event: keypad
data: f
id: 0003

event: button-a
data: pressed
id: 0004
*/





const url = "wss://echo.websocket.org"

const socket = new WebSocket(url)
socket.onopen = evt => console.log('open')
socket.onclose = evt => console.log('close')
socket.onmessage = evt => console.log(`message: ${evt.data}`)
socket.onerror = evt => console.log('error')

setTimeout(function(){
  socket.send('HELLO')
}, 1000)




// pusher


const url = 'wss://ws-eu.pusher.com/app/663fbc85a06feec56503?client=js&version=3.2&protocol=5'
const socket = new WebSocket(url)

socket.onmessage = (message) => {
  const payload = JSON.parse(message.data)
  const event = payload.event
  const data = payload.data

  console.log(event, data)

}

socket.onopen = () => {

  socket.send(JSON.stringify({
    "event": "pusher:subscribe",
    "data": {
      "channel": "input"
    }
  }))

}
