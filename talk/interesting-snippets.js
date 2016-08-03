var source = document.createElement('textarea')
var target = document.createElement('iframe')

document.body.appendChild(source)
document.body.appendChild(target)

source.onkeyup = function(){
  target.src = 'data:text/html;charset=utf-8,' +
    encodeURI('<body><scr'+'ipt>'+source.value+'</scr'+'ipt>')
}
