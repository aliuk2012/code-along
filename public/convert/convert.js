// building is problematic because acorn.es
// import buble from './buble.deps.js'
// import rollup from './rollup.browser.js'

var modules = [

  'draw', 'greeter', 'store', 'util', 'messaging', 'audio', 'canvas', 'helpers'

].reduce(function(memo, item){
  memo[item] =
    fetch('es_modules/' + item + '.js')
      .then(function(r){ return r.text()})
  return memo
}, {})

var scriptRegex = /^\s*\/\/\+(https:\/\/\S*)$/gm

function convert (files) {
  var main, local_modules, scripts = ''

  // horribly hacky, pull out any external scripts
  // before rollup removes comments
  function extract_scripts(code){
    while(match = scriptRegex.exec(code))
      scripts += '<script src="'+match[1]+'"></script>\n'
    return code
  }

  if(files) {
    main = extract_scripts(files.store[0].body.getValue())
    local_modules = files.store.reduce(function(memo, f){
      memo[f.name] = extract_scripts(f.body.getValue())
      return memo
    }, {})
  } else {
    main = ''
    local_modules = {}
  }



  // IMPORTANT, loop protect must be loaded frontend too
  // source = loopProtect(source + '\n')

  return rollup.rollup({
    entry: '__main__',
    plugins:[
      {
        resolveId: function(importer, importee) {
          return importer
        },
        load: function(id) {
          if(id == '__main__') return main
          return local_modules[id] || modules[id] || Promise.reject("not provided")
        }
      },
      {
        transformBundle: function(d){
          return buble.transform(d).code
        }
      },
      {
        transformBundle: function(d){
          return loopProtect(d) + '\n'
        }
      }
    ]
  })
  .then(function(bundle){

    var code = bundle.generate({
      format: 'iife'
    }).code

    return scripts +
          '<script id="injected">' +
            code +
          '</script>'

  })
}
