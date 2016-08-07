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
