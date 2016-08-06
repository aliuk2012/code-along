var source = []

function store(user, key, value) {
  user  = norm(user, 10)
  key   = norm(key, 10)
  value = norm(value, 50)

  if(!(
    user && key && value
  )) return false

  var user_count = 0
  source = source.filter(function(s){
    // TODO - check if array.splice would be more efficient
    return !(
      s[0] == user && (
        s[1] == key || // key matches
        user_count++ > 10 // we've see too many by this user
      )
    )
  })

  source.unshift([user, key, value])

  while(source.length > 2000) {
    source.pop()
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
  }).then(function(d){console.log(d)})
}

function getAll(key){
  return source.filter(function(item){
    return item[1] == key
  }).map(function(item){
    return item[2]
  })
}


var populate = fetch('/content')
  .then(function(res){ return res.text()})
  .then(function(text){
    console.log("content:" + text)
    code.setValue(text)
  })


// don't listen if we're the master (other checks too)
if(document.location.hash != '#master') {

  fetch('/pusher/config')
    .then(function(res){return res.json()})
    .then(function(config){
      var pusher = new Pusher(config.key, config.options)

      var channel = pusher.subscribe('codealong')

      channel.bind('update', function(action){
        console.log("update", action)

        code.setOption('readOnly', action.readOnly ? 'nocursor' : false)

        if(typeof(action.body) !== 'undefined') {
          code.setValue(action.body)
        }

      })

      // Pusher.logToConsole = true

      var presence = pusher.subscribe('presence-codealong')
      presence.bind('pusher:subscription_succeeded', function(e){
        var element = document.getElementById('connection-state')
        element.style.display = 'block'
        element.className = 'connected'
        element.innerText = '_'+e.myID
      })


      fetch('/store')
        .then(function(res) {return res.json()})
        .then(function(json) {
          source = json
        })
      var storeC = pusher.subscribe('codealong_store')
      storeC.bind('add', function(event){
        (event.rows||[]).forEach(function(row){
          store.apply(null, row)
        })
      })

      /*
      fetch('/store',{
          method: 'POST',
          body: JSON.stringify({
            key: 'THE KEY',
            value: 'MY VALUE'
          }),
          credentials:'same-origin',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(function(d){console.log(d)})
      */


    })

} else {

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
