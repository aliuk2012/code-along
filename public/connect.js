function doc(text){
  return new CodeMirror.Doc(text, 'javascript')
}

function FileSet(){
  this.store = [{
    name: 'main.js',
    body: doc(''),
  }]
  this.current = 0
  this.listeners = []
}
FileSet.prototype.listen = function(fn) {
  this.listeners.push(fn)
  fn(this.store)
}
FileSet.prototype.notify = function(){
  var store = this.store
  this.listeners.forEach(function(l){
    l(store)
  })
}
FileSet.prototype.add = function (name) {
  this.current = this.store.push({
    name: name,
    body: doc('// ' + name)
  }) - 1
  this.notify()
}
FileSet.prototype.select = function (idx) {
  this.current = idx
  this.notify()
}

FileSet.prototype.rm = function (idx) {
  if(idx <= this.current) this.current--

  this.store.splice(idx, 1)

  this.notify()
}

FileSet.prototype.deserialise = function(text) {
  var re = /\S+/
  this.store =
  text.split('//____')
  .map(function(part, i) {

    if(i==0)
      return {
        name: 'main.js',
        body: doc(part)
      }

    var idx = part.indexOf('\n')
    var name = part.substr(0, idx)
    var body = part.substr(idx+1)

    return {
      name: name,
      body: doc(body)
    }

  })

  if(this.current > this.store.length-1) {
    this.current = this.store.length-1
  }

  this.notify()
}


FileSet.prototype.serialise = function(text) {
  return this.store.map(function(item, i){
    if(i)
      return '//____'+item.name+'\n'+
             item.body.getValue()
    else
      return item.body.getValue()

  }).join('')
}


var files = new FileSet

files.listen( function(d) {
  code.swapDoc(d[files.current].body)
})



var target_iframe = document.querySelector('iframe')

var user_connection = (function(){
  var href = document.location.href

  if(href.indexOf('?independent') > 0) {
    return {
      type: 'independent'
    }
  }

  if(href.indexOf('?master') > 0) {
    return {
      type: 'master'
    }
  }

  var match = href.match(/\?connect=(.+)/)
  if(match) {
    return {
      type: 'connect',
      target: match[1]
    }
  }

  return {
    type: 'default'
  }
})()

var showDialog = (function setup(){
    var modal = document.getElementById('connection-modal')
    var other_editor = document.getElementById('other-editor')

    var file_modal = document.getElementById('file-list-modal')
    var file_name = document.getElementById('filename-input')

    var overlay = document.getElementById('connection-overlay')

    function hide_modals(){
      overlay.className = 'hidden'
      file_modal.className = modal.className = 'modal hidden'
    }

    overlay.addEventListener('click', hide_modals)

    switch (user_connection.type) {
      case 'default':
        modal.children[0].className = 'current'; break
      case 'independent':
        modal.children[1].className = 'current'; break
      case 'connect':
        modal.children[2].className = 'current'; break
    }

    modal.children[0].addEventListener('click', function(e){
      e.preventDefault()
      document.location = '/'
    }, false)

    modal.children[1].addEventListener('click', function(e){
      e.preventDefault()
      document.location = '/?independent'
    })
    modal.children[2].addEventListener('click', function(e){
      e.preventDefault()
      other_editor.focus()
    })
    modal.addEventListener('submit', function(e){
      e.preventDefault()
      document.location = '/?connect=' + other_editor.value
    })


    // File List

    file_modal.addEventListener('submit', function(e){
      e.preventDefault()
      if(file_name.value) {
        files.add(file_name.value)
        file_name.value = ''
        hide_modals()
      }
    })

    var fileList = file_modal.children[0]

    function updateList() {

      fileList.innerHTML = ''

      files.store.forEach(function(file, i){

        var label = document.createElement('label')
        label.innerText = file.name

        if(files.current == i)
         label.className = 'current'

        label.addEventListener('click', function(e){
          files.select(i)
          hide_modals()
        }, false)

        if(i) {
          var rm = document.createElement('a')
          rm.className = 'rm'
          rm.href = '#'
          rm.innerHTML = '&times;'
          rm.addEventListener('click', function(e){
            e.preventDefault()
            e.stopPropagation()
            files.rm(i)
            updateList()
          }, false)

          label.appendChild(rm)
        }

        fileList.appendChild(label)
      })
    }


    return function(which){
      switch (which) {
        case 'connection':
          modal.className = 'modal'
          overlay.className = ''
          break;
        case 'files':
          file_modal.className = 'modal'
          overlay.className = ''
          updateList()
          break;
        default:
          console.log("unkown dialog " + which)
      }
    }
})()


// hook up the file button
files.listen(function(store){
  document.getElementById('file-state')
    .innerText = store[files.current].name
})



// setInterval(function(){
//   target_iframe.contentWindow.postMessage({r:Math.random()}, '*')
// target_iframe.contentWindow.postMessage('asdf','*')
// }, 1000)

var url = user_connection.target ?
   '/content/' +  user_connection.target :
   '/content'

console.log(url)
// initial populate
var populate = fetch(url)
  .then(function(res){ return res.text()})
  .then(function(text){
    files.deserialise(text)
    load()
    // code.setValue(text)
  })

var pusherClient = fetch('/pusher/config')
  .then(function(res){return res.json()})
  .then(function(config){return new Pusher(config.key, config.options)})

/*
  "login" to the channel & set up store
*/
var userId = new Promise(function(resolve, reject){
  pusherClient.then(function(pusher){

    var presence = pusher.subscribe('presence-codealong')
    presence.bind('pusher:subscription_succeeded', function(e){

      var element = document.getElementById('connection-state')
      element.style.display = 'block'
      element.className = user_connection.type;
      element.innerText = ''+e.myID

      if(user_connection.type == 'connect')
        element.innerText = e.myID + ' → ' + user_connection.target

      if(user_connection.type == 'master')
        element.innerText = e.myID + ' (master)'

      element.href = 'javascript:showDialog("connection")'

      // store = remoteStore(pusher, e.myID)

      store.connect(
        pusher,
        e.myID,
        '/store',
        'codealong_store'
      )

      resolve(e.myID)
    })

  })

})

// userId.then(function(d){console.log("user id", d)})



// there are backend checks too
var isMaster = user_connection.type == 'master'

var publishing = isMaster || user_connection.type == 'independent'

/*
  Listen for code updates
*/
if(!publishing) {
  // not if we're pushing out as the master

  pusherClient
    .then(function(pusher){

      var channelName = user_connection.target ?
        'codealong_' + user_connection.target :
        'codealong'

      var channel = pusher.subscribe(channelName)

      channel.bind('update', function(action){
        console.log("update", action)

        code.setOption('readOnly', action.readOnly ? 'nocursor' : false)

        if(typeof(action.body) !== 'undefined') {
          // TODO - THIS COULD GET CALLED ALOT
          // MAKING LOTS OF NEW DOCUMENTS
          files.deserialise(action.body)
          load()
          // code.setValue(action.body)
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

        console.log("putting (master)")

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



if(user_connection.type == 'independent') {

  console.log("Independent!")

  populate
    .then(function(){
      code.setValue('//--')

      userId
        .then(function(id){

          fetch('/content/' + id)
            .then(function(res){ return res.text()})
            .then(function(text){

              console.log(text)

              files.deserialise(text)
              // code.setValue(text)
              load()

              code.on('change', debounce(function(){
                // return console.log("ignoring change")

                console.log("putting " + id)

                fetch('/content/' + id, {
                  credentials: 'same-origin',
                  method: 'PUT',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    value: files.serialise()
                  })
                })

              },750))

            })


        })


      function debounce(fn, millis, timer){
        return function(){
          clearTimeout(timer)
          timer = setTimeout(fn,millis,arguments)
        }
      }

    })

}

/*
  Connect up inputs
*/

pusherClient
  .then(function(client){
    client.subscribe('input')
      .bind('dial', handler('dial'))
      .bind('a', handler('a'))
      .bind('b', handler('b'))

    function handler(input) {
      return function(data){
        target_iframe.contentWindow.postMessage({
          fao:'messaging',
          input: input,
          value: data
        }, '*')
      }
    }

  })
//
//
// window.shareChannel = pusherClient
//   .then(function(client){
//
//     var currentScriptHash;
//
//     return {
//       subscribe: function(scriptHash, fnHash) {
//         if(currentScriptHash !== scriptHash) {
//           client.allChannels();
//           console.group('Pusher - subscribed to:');
//           for (var i = 0; i < channels.length; i++) {
//               var channel = channels[i];
//               console.log(channel.name);
//           }
//         }
//       },
//       trigger: function(c, arguments) {
//
//       }
//     }
//   })
