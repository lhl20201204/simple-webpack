
let map = new Map()
function require (path) {
  if (!map.has(path)) {
    map.set(path, global[path]())
  }
  return map.get(path)
}
const global = {
  "./entry.js": function () {
    const module = {
      exports: null
    }
      ; (function (module, exports, require) {
        let { a } = require("./a.js");
        console.log(a)
        alert(a("lhl", "考了"))
      })(module, module.exports, require)
    return module.exports
  }, "./a.js": function () {
    const module = {
      exports: null
    }
      ; (function (module, exports, require) {
        let { b } = require("./b.js")

        const a = function (x, y) {
          return b(x, y) + 100
        }
        module.exports = {
          a: a
        }
      })(module, module.exports, require)
    return module.exports
  }, "./b.js": function () {
    const module = {
      exports: null
    }
      ; (function (module, exports, require) {
        const b = function (x, y) {
          return x + y
        }

        module.exports = {
          b: b
        }
      })(module, module.exports, require)
    return module.exports
  },
}
global["./entry.js"]();
