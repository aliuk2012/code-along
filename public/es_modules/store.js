window.addEventListener('message', function(e){
  console.log("ok", e.data)
}, false)

export function set(key, value) {
  return window.parent.store.set(key, value)
}

export function get(key) {
  return window.parent.store.get(key)
  // return Promise.resolve('foo')
}

export function getAll(key) {
  return window.parent.store.getAll(key)
}

export function subscribe(key) {
  console.log("subscribing", key)
}

export function subscribeAll(key) {
  console.log("subscribing All", key)
}
