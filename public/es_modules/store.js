var subscribers = []

window.addEventListener('message', function(e){
  console.log("ok", e.data)
  subscribers.forEach(function(s){
    s(e.data)
  })
}, false)

export function setItem(key, value) {
  return window.parent.store.setItem(key, value)
}

export function getItem(key) {
  return window.parent.store.getItem(key)
}

export function getItems(key) {
  return window.parent.store.getItems(key)
}

// needs to be different for admin
export function subItem(key, fn) {
  console.log("subscribing", key)
  subscribers.push(function(data){
    if(data.user == null && data.key == key) {
      // getItem(fn)
      fn(data.value)
    }
  })

  getItem(key).then(fn)
}

export function subItems(key, fn) {
  console.log("subscribing All", key)

  subscribers.push(function(data){
    if(data.user != null && data.key == key) {
      getItems(key).then(fn)
    }
  })

  getItems(key).then(fn)
}
