export function get(key) {
  return Promise.resolve('foo')
}

export function set(key, value) {
  return window.parent.store.set(key, value)
}


export function getAll(key) {
  return window.parent.store.getAll(key)
}
