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

function convert (source) {

  // IMPORTANT, loop protect must be loaded frontend too
  source = loopProtect(source + '\n')

  return rollup.rollup({
    entry: '__main__',
    plugins:[
      {
        resolveId: function(importer, importee) {
          return importer
        },
        load: function(id) {
          if(id == '__main__') return source
          return modules[id] || Promise.reject("not provided")
        }
      },
      {
        transformBundle: function(d){
          return buble.transform(d).code
        }
      }
    ]
  })
  .then(function(bundle){

    var code = bundle.generate({
      format: 'iife'
    }).code

    // look for any external includes
    var includes = '', match

    while(match = scriptRegex.exec(code))
      includes += '<script src="'+match[1]+'"></script>\n'

    return includes + '<script id="injected">' +
      code +
      '</script>'

  })
}
