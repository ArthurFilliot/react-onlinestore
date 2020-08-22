const express = require("express");
const chokidar = require("chokidar");
const functions = require("./functions")();

const folderpath = "datas/categories";
const filepathpattern = new RegExp("^"+folderpath+"/[0-9]*\.json$");

let synopsis = new Array();
let idxbyid = new Map();

const addOrUpdate = fileFun([
    (id, obj) => (obj!=null) ? idxbyid.set(id, obj) : idxbyid.delete(id),
    (id, obj) => (obj!=null) ? synopsis.push(obj) : synopsis = synopsis.filter(elem => elem.id!==id)]);
const remove = fileFun([
        (id, obj) => idxbyid.delete(id),
        (id, obj) => synopsis = synopsis.filter(elem => elem.id!==id)]);

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
        res.send(obj);
    })
    .get('/', function(req,res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(synopsis);
    })
module.exports = router;