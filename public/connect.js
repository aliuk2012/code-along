
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
