var pusher, channel
var socket_id
var ignore

if(document.location.hash) {
  var connectionState = document.getElementById('connection-state')
  connectionState.style.display = 'block'

  var key = document.location.hash.substr(1)

  var contentPath = 'content/' + key
  var channelName = 'presence-' + key

  console.log("connecting: " + channelName)

  fetch(contentPath)
    .then(function(res){
      return res.text()
    })
    .then(function(text){
      console.log("content:" + text)
      code.setValue(text)
    })

  fetch('/pusher/config')
    .then(function(res){return res.json()})
    .then(function(config){
      pusher = new Pusher(config.key, config.options)

      channel = pusher.subscribe(channelName)

      channel.bind('pusher:subscription_succeeded', function(m){
        connectionState.innerText = m.myID
        socket_id = m.myID// UPDATE
      })

      var timer
      channel.bind('content', function(content) {
        console.log("new content")
        clearTimeout(timer)
        ignore = true
        code.setValue(content)
        timer = setTimeout(function(){
          console.log('ok')
          ignore = false
        }, 1000)
      })
    })




    code.on('change', debounce(function(){
      if(ignore) return console.log("ignoring")

      console.log("putting")

      fetch(contentPath, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          socket_id: socket_id,
          content: code.getValue()
        })
      })

    },750))

    function debounce(fn, millis, timer){
      return function(){
        clearTimeout(timer)
        timer = setTimeout(fn,millis,arguments)
      }
    }

}
