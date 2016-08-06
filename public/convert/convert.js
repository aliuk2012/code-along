// building is problematic because acorn.es
// import buble from './buble.deps.js'
// import rollup from './rollup.browser.js'

var modules = [

  'draw', 'greeter', 'store', 'util'

].reduce(function(memo, item){
  memo[item] =
    fetch('es_modules/' + item + '.js')
      .then(function(r){ return r.text()})
  return memo
}, {})

function convert (source) {

  // IMPORTANT, loop protect must be loaded frontend too
  source = loopProtect(source)

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
    return bundle.generate({
      format: 'iife'
    }).code
  })
}
