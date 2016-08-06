
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

  var row = [user, key, value]

  while(state.length > 2000) {
    state.pop()
  }

  return row

}


function norm(t, l){
  return String(t).trim().substr(0,l||10)
}

module.exports = store

module.exports.getSource = function(){
  return state
}
