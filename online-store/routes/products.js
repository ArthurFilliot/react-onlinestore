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
            let obj = idxbyid.get(id);
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
const addHyperMedia = transform([
    (args, obj) => {if (!obj.uri) obj.uri='/api/products/byid/'+args[0]}]);

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
        let id = parseInt(req.params.id);
        let obj = idxbyid.get(id);
        addHyperMedia(obj,obj.id);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control','max-age=60');
        res.send(obj);
    })
    .get('/byname/:pattern', function(req,res) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control','no-cache');
        let pattern = "^.*"+req.params.pattern.toLowerCase()+".*$"
        console.log("pattern :" +pattern)
        let regexp = new RegExp(pattern)
        let results = 
            Array.from(idxbyname)
                .filter(entry => regexp.test(entry[0]))
                .map(entry=>addHyperMedia(entry[1],entry[1].id));
        res.send(results);
    })
module.exports = router;