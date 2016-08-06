var source = document.createElement('textarea')
var target = document.createElement('iframe')

document.body.appendChild(source)
document.body.appendChild(target)

source.onkeyup = function(){
  target.src = 'data:text/html;charset=utf-8,' +
    encodeURI('<body><scr'+'ipt>'+source.value+'</scr'+'ipt>')
}






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
