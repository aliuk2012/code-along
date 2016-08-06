var store = {getAll: function() {return []}, set: function(){}}


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

    store = remoteStore(pusher, e.myID)
  })

})



// there are backend checks too
var isMaster = document.location.hash != '#master'


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

function remoteStore(pusher){

  var state = []

  // populate
  fetch('/store')
    .then(function(res) {return res.json()})
    .then(function(json) {
      state = json
    })

  // connect
  pusher.subscribe('codealong_store')
    .bind('add', function(event){
      (event.rows||[]).forEach(function(row){
        store.apply(null, row)
      })
    })


  function store(user, key, value) {
    user  = norm(user, 10)
    key   = norm(key, 10)
    value = norm(value, 50)

    if(!(
      user && key && value
    )) return false

    var user_count = 0
    state = state.filter(function(s){
      // TODO - check if array.splice would be more efficient
      return !(
        s[0] == user && (
          s[1] == key || // key matches
          user_count++ > 10 // we've see too many by this user
        )
      )
    })

    state.unshift([user, key, value])

    while(state.length > 2000) {
      state.pop()
    }


    function norm(t, l){
      return String(t).trim().substr(0,l||10)
    }
  }

  function set(key, data) {
    fetch('/store',{
      method: 'POST',
      body: JSON.stringify({
        key: key,
        value: data
      }),
      credentials:'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }

  function getAll(key){
    return state.filter(function(item){
      return item[1] == key
    }).map(function(item){
      return item[2]
    })
  }

  var timers = {}
  function setDebounced(key, data) {
    clearTimeout(timers[key])
    timers[key] = setTimeout(function(){
      fetch('/store',{
        method: 'POST',
        body: JSON.stringify({
          key: key,
          value: data
        }),
        credentials:'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
    }, 500)
  }

  return {
    set: setDebounced,
    getAll: getAll,
    source: function(){
      return source
    }
  }
}
