var module = require('module')
var express = require('express')
const app = express();
const router = express.Router();

app.get('/', function(req, res){
  res.send("hi.")
})

var common = require('./music-chart/common.js')
var genie = require('./music-chart/genie.js');
var melon = require('./music-chart/melon.js');
var vibe = require('./music-chart/vibe.js');

// genie
router.route('/music-chart/genie/song/:musicId').get(genie.setDetail, genie.getDetail);
router.route('/music-chart/genie/summary').get(genie.setList, genie.getList);
router.route('/music-chart/genie/songs').get(genie.getDetailList);

// melon
router.get('/music-chart/melon/song/:musicId', melon.setDetail, melon.getDetail);
router.get('/music-chart/melon/summary', melon.setList, melon.getList);
router.get('/music-chart/melon/songs', melon.getDetailList);

// vibe
router.get('/music-chart/vibe/song/:musicId', vibe.setDetail, vibe.getDetail);
router.get('/music-chart/vibe/summary', vibe.setList, vibe.getList);
router.get('/music-chart/vibe/songs', vibe.getDetailList);

module.exports = router;