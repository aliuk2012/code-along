// Store for wrapper page

var store = (function (){

  var state = []

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

    notify(user, key, value)

  }

  function setItem(key, value) {
    key   = norm(key, 10)
    value = norm(value, 50)

    var set = localforage.setItem(key, value)
    setRemote(key, value)
    notify(null, key, value)

    return set
  }

  function getItems(key){
    return Promise.resolve(
      state.filter(function(item){
        return item[1] == key
      }).map(function(item){
        return item[2]
      })
    )
  }

  function getItem(key){
    return localforage.getItem(key)
  }

  // push up (debounce per-key)
  var timers = {}
  function setRemote(key, value) {
    clearTimeout(timers[key])
    timers[key] = setTimeout(function(){
      fetch('/store',{
        method: 'POST',
        body: JSON.stringify({
          key: key,
          value: value
        }),
        credentials:'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
    }, 500)
  }

  function norm(t, l){
    return String(t).trim().substr(0,l||10)
  }

  function notify(user, key, value){
    target_iframe.contentWindow.postMessage({
      user:user,
      key:key,
      value:value
    }, '*')
  }

  function notifyAll(){
    target_iframe.contentWindow.postMessage({
      all:true
    }, '*')
  }

  return {

    setItem:  setItem,
    getItem:  getItem,
    getItems: getItems,

    state: function(){
      return state
    },

    connect: function(pusher, user_id, endpoint, channel) {
      // populate
      fetch(endpoint || '/store')
        .then(function(res) {return res.json()})
        .then(function(json) {
          state = json;

          notifyAll()

        })

      // connect
      pusher.subscribe(channel || 'codealong_store')
        .bind('add', function(event){
          (event.rows||[]).forEach(function(row){
            store.apply(null, row)
          })
        })

    }

  }
})()
