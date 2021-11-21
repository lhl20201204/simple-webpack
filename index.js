//node index.js 然后去看public/index.js即可

const fs = require("fs")
const { resolve } = require("path")
var map = new Map()
function addFileToGlobal (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", function (err, data) {
      if (err) {
        return reject(err)
      }
      let src = data
      let dependencies = []

      src = src.replace(/import\s+(.*?)\s+from\s+(.*?)(?=(;|(\r\n)))/g, function (argument, node1, node2) {
        // console.log("11111", node1, node2)
        if (dependencies.indexOf(node2) === -1) {
          dependencies.push(node2)
        }
        let nn = 'let ' + node1 + " = require(" + node2 + ")";
        return nn
      })

      src = src.replace(/export\s+/g, function (argument) {
        // console.log("00000", argument)
        return "module.exports = "
      })

      src = src.replace(/(const|let|var)\s+(.*?)\s+=\s+require\((.*?)\)(?=(;|(\r\n)))/g, function (argument, node1, node2, node3) {
        //console.log("22222", node2, node3)
        if (dependencies.indexOf(node3) === -1) {
          dependencies.push(node3)
        }

        return argument
      })

      src = src.replace(/(module\.exports\s*=\s+)([\w|\W]*)/g, function (all, node1, node2) {
        var def = node2

        let x = def.match(/(function\s+)(.*?)(\s|\(|\{)([\w|\W]*)/)


        let key = x ? x[2] : node2
        let ccccc = !x ? `
      module.exports={
        ${key}:${key}
      }`: `
      const ${key} = ${x[1]}${x[3]}${x[4]}
      module.exports={
        ${key}:${key}
      }`
        //console.log(ccccc)
        return ccccc
      })
      console.log(dependencies)
      if (!map.has(path)) {
        map.set(path, `"${path}":function(){
      const module={
           exports:null
      }
      ;(function (module,exports,require) {
            ${src}
        })(module,module.exports,require)  
         return module.exports
      },`)
      }

      let cc = map.get(path)
      let promiseAll = []
      if (dependencies) {
        for (var p of dependencies) {
          if (!map.has(p)) {
            let promise = addFileToGlobal(p.slice(1, -1))
            promiseAll.push(promise)
          }
        }
      }

      if (promiseAll.length) {
        Promise.all(promiseAll).then(res => {
          for (c of res) {
            cc = cc + c
          }
          resolve(cc)
        }).catch(err => reject(err))
      } else {
        resolve(cc)
      }
      //文件写入成功。
    })
  })
}

let path = "./entry.js"
addFileToGlobal(path).then(cc => {
  let code = `
      let map = new Map()
    function require (path) {
      if (!map.has(path)) {
      map.set(path, global[path]())
     }
    return map.get(path)
    }
        const global={
           ${cc}
        }
          global["${path}"]();
      `
  fs.writeFile("./public/bundle.js", code, err => {

  })
})



