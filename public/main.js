ES6Promise.polyfill()

var htm = document.getElementsByTagName('html')[0]
toggle.onclick = function(e){
  e.preventDefault()
  htm.classList.toggle('fill')
}

var code = CodeMirror(document.getElementById('code'), {
  value: "",
  mode:  "javascript",
  lineWrapping: true,
  // readOnly: true
})

var textarea = document.querySelector('textarea')
var iframe   = document.querySelector('iframe')
var error_el = document.getElementById('error')

var template = fetch('template.txt')
                 .then(function(r){return r.text()})

function load(){
  convert(code.getValue())
    .then(function(code){
      template
        .then(function(text) {

          URL.revokeObjectURL(iframe.src)

          var blob = new Blob([text
            .split('{{INJECT}}')
            .join(code)], {type: 'text/html'})

          var url = URL.createObjectURL(blob)
          iframe.src = url
        })
    })
  .then(function(ok){
    error_el.style.display = 'none'
  }, function(err){
    error_el.style.display = 'block'
    error_el.innerText = err
  })

}

load()
code.on('change', debounce(load, 200))

function debounce(fn, millis, timer){
  return function(){
    clearTimeout(timer)
    timer = setTimeout(fn,millis,arguments)
  }
}
