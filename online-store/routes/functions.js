const path = require('path');
const fs = require("fs");

module.exports = function() { 
    this.fileFun = function fileFun(mappings) {
        return function (filepath) {
            let id = parseInt(path.parse(filepath).base.split('.').shift());
            fs.exists(filepath,(exists) => {
                if (exists) {
                    let obj  = JSON.parse(fs.readFileSync(filepath));
                    if (id===obj.id) {
                        mappings.forEach (mapping => {
                            mapping(id,obj)
                        })
                    }else{
                        mappings.forEach (mapping => {
                            mapping(id,null)
                        })
                    }
                }else{
                    mappings.forEach (mapping => {
                        mapping(id,null)
                    })
                }
            });
        }
    }
}
