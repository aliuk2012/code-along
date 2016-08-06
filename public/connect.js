var target_iframe = document.querySelector('iframe')

// setInterval(function(){
//   target_iframe.contentWindow.postMessage({r:Math.random()}, '*')
// target_iframe.contentWindow.postMessage('asdf','*')
// }, 1000)


// initial populate
var populate = fetch('/content')
  .then(function(res){ return res.text()})
  .then(function(text){
    code.setValue(text)
  })

var pusherClient = fetch('/pusher/config')
  .then(function(res){return res.json()})
  .then(function(config){return new Pusher(config.key, config.options)})

/*
  "login" to the channel & set up store
*/
pusherClient.then(function(pusher){

  var presence = pusher.subscribe('presence-codealong')
  presence.bind('pusher:subscription_succeeded', function(e){

    var element = document.getElementById('connection-state')
    element.style.display = 'block'
    element.className = 'connected'
    element.innerText = '_'+e.myID

    // store = remoteStore(pusher, e.myID)
    
    store.connect(
      pusher,
      e.myID,
      '/store',
      'codealong_store'
    )
  })

})



// there are backend checks too
var isMaster = document.location.hash == '#master'


/*
  Listen for code updates
*/
if(!isMaster) {
  // not if we're pushing out as the master

  pusherClient
    .then(function(pusher){

      var channel = pusher.subscribe('codealong')

      channel.bind('update', function(action){
        console.log("update", action)

        code.setOption('readOnly', action.readOnly ? 'nocursor' : false)

        if(typeof(action.body) !== 'undefined') {
          code.setValue(action.body)
        }

      })
    })
}


/*
  Send code updates
*/

if(isMaster) {

  console.log("Master!")

  populate
    .then(function(){

      code.on('change', debounce(function(){

        console.log("putting")

        fetch('/content', {
          credentials: 'same-origin',
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: code.getValue()
          })
        })

      },750))

      function debounce(fn, millis, timer){
        return function(){
          clearTimeout(timer)
          timer = setTimeout(fn,millis,arguments)
        }
      }

    })

}
