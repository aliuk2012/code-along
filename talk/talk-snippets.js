## Talk snippets




// transcoding
document.body.innerText = document.getElementsByTagName('html')[0].outerHTML

document.body.style.whiteSpace = 'pre'


// data-uris

const a = document.createElement('a')
a.target = '_blank'
a.href = 'data:text/html,<h1>Hello!'
a.innerText = 'hello?'

document.body.appendChild(a)


// Blobs

const blob = new Blob(['<h1>Hello!'], {type: 'text/html'})

const a = document.createElement('a')
a.target = '_blank'
a.href = URL.createObjectURL(blob)
a.innerText = 'hello!!'

document.body.appendChild(a)



// JS2016

document.currentScript.className = 'visible'

const hey = (you) =>
  console.log(`HELLO ${you}`)





// External Modules

document.currentScript.className = 'visible'

import {background} from 'util'

background('#f08')






// Code protect

document.currentScript.className = 'visible'

import {text} from 'util'

for(var i = 99; i > 0; i++) {
  console.log(`${i} bottles of beer`)
}

text('Hello')
