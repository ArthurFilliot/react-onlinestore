const express = require("express");
const chokidar = require("chokidar");
const functions = require("./functions")();

const folderpath = "datas/products";
const filepathpattern = new RegExp("^"+folderpath+"/[0-9]*\.json$");

let idxbyid = new Map();
let idxbyname = new Map();

const addOrUpdate = fileFun([
    (id,obj) => {
        if (obj!=null) {
            idxbyid.set(id, obj)
            idxbyname.set(obj.name.toLowerCase(), obj)
        }else {
            var obj = idxbyid.get(id);
            if (obj!=null) {
                idxbyname.delete(obj.name.toLowerCase())
                idxbyid.delete(id)
            }
        }
    }]);
const remove = fileFun([
        (id,obj) => {
            idxbyname.delete(idxbyid.get(id).name.toLowerCase())
            idxbyid.delete(id)
        }]);

chokidar.watch(folderpath, { 
        persistent: true,
        ignoreInitial: false,
        ignored: function (path) {
            return (path==folderpath) ? false : !filepathpattern.test(path);
        }
    })
    .on('add',    async filePath => addOrUpdate(filePath))
    .on('change', async filePath => addOrUpdate(filePath))
    .on('unlink', path => remove(path))

var router = express.Router();
router
    .get('/byid/:id', function(req,res) {
        var id = parseInt(req.params.id);
        var obj = idxbyid.get(id);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control','max-age=60');
        res.send(obj);
    })
    .get('/byname/:pattern', function(req,res) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control','no-cache');
        var pattern = "^.*"+req.params.pattern.toLowerCase()+".*$"
        console.log("pattern :" +pattern)
        var regexp = new RegExp(pattern)
        var results = 
            Array.from(idxbyname)
                .filter(entry => regexp.test(entry[0]))
                .map(entry=>entry[1]);
        res.send(results);
    })
module.exports = router;