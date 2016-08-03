# Live coding across all the things

> We'll look at building a browser-based script editor, covering some useful things like code transpilation, module loading, tree shaking & infinite loop detection. Then we'll distribute our code changes to create a multi-device, multi-user, web-based, super-fun development environment.

* Hello!
* part 1 - editing in browser
* The problem statement
* The basic solution elements
* Populating a window
  * data-uri
    * btoa
  * blob urls
  * frame.contentWindow.append?
  * service worker
* Making it feel like more of a text editor {{We expect things to look better}}
  * plugins:
    * ace editor
    * CodeMirror
    * Monaco
  * content-editable?
* Transforming JS {{Do we even write javascript anymore}}
  * build tools & transform
  * Babel
  * Bublé
    * difference from babel
    * unsupported features
  * using this in our example - buble.transform(d).code
* Other files
  * generally we don't have a single isolated js script
  * browserify, webpack, requirejs, sprokets, brocolli, grunt, gulp, brunch
  * Rollup.js
    * difference from other stuff
    * es2016
    * d3.js, three.js
  * using this in our example rollup.rollup
* Loop detection
  * problem - unresponsive scripts
  * loop-protect, how this works



* part 2 - across all the things



```
for(var i = 0; i < 100; i--){
  console.log("whoop whoop")
}

{;loopProtect.protect({ line: 1, reset: true });
for(var i = 0; i < 100; i--){;
  if (loopProtect.protect({ line: 1 })) break;

  console.log("whoop whoop")
}}
```


---

Links:
*  In Browser Code Editing - Marijn Haverbeke - https://www.youtube.com/watch?v=4UlNIb8i9j8
* Atom not being embeddable - https://github.com/atom/atom/issues/3451#issuecomment-54510710
* Tail opt without trampoline http://glat.info/pub/tailopt-js/
* TCO explained - http://benignbemine.github.io/2015/07/19/es6-tail-calls/
* loop-protect - https://github.com/jsbin/loop-protect
* hyperdev - https://hyperdev.com/
* compile-to-js - https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js
* es2015 - https://github.com/samccone/The-cost-of-transpiling-es2015-in-2016
