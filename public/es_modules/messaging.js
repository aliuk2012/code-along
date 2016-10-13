var subscribers = []

window.addEventListener('message', function(e){
  if(e.data.fao == 'messaging')
    subscribers.forEach(function(s){
      s(e.data)
    })
}, false)

// subscribe to an input channel
export function subscribe(input, callback) {
  subscribers.push(function(message){
    if(message.input == input)
      callback(message.value)
  })
}


function hash(str) {
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    hash = ((hash<<5)-hash)+str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}


var scriptHash // unique identifier for this build

// give a version of this function that is shared amongst everyone else
export function share(fn) {
  scriptHash = scriptHash || hash(document.currentScript.innerHTML)
  const fnHash = hash(fn.toString())

  console.log(scriptHash, fnHash)

  return function(){
    fn.apply(this, arguments)
  }
}
