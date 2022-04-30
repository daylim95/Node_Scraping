const cheerio = require('cheerio')
const request = require('request')
const common = require('./common.js')
const fs = require('fs')
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const db_path = "../db/db.json"
const db = new JsonDB(new Config(db_path, true, false, '/'));

const url = "https://www.genie.co.kr/chart/top200";
const url_detail = "https://www.genie.co.kr/detail/albumInfo?axnm=";

// 음원 순위 저장
exports.setList = function(req, res, next){
  
  var db_data = null;
  var token = true;

  // 데이터가 없거나 업데이트 시간이 30분이 지난 경우에만 조회하도록 함
  if(fs.readFileSync(db_path, 'utf-8')!=""){
    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'))
    if(Object.keys(db_data).includes("genie_updated_at")){
      var updated = new Date(db_data.genie_updated_at);
      if((new Date().getTime() - updated.getTime()) < (1000*60) * 30){
        token = false;
      }
    }
  }else{ fs.writeFileSync(db_path, "{}") }

  if(token){

    // if(Object.keys(req).includes("url")){
    //  url = req.url;
    // }

    request(url, function (error, response, html) {

      var list = new Array();
    
      if (!error) {
    
        var $ = cheerio.load(html);

        $('.list-wrap > tbody > .list').each(function () {
    
          var song = new Object();
    
          song.ranking = $(this).children('.number').text().split("\n", 1)[0];
          song.name = $(this).children('.info').children('.title').text().split("\n").reverse()[0].trim();
          song.singer = $(this).children('.info').children('.artist').text();
          song.album = $(this).children('.info').children('.albumtitle').text();
          song.albumNo = $(this).children('.info').children('.albumtitle').attr('onclick').split("'")[1];
          song.musicId = common.setMusicId(song.name + '_' + song.singer);

          list.push(song);
        })

        db.push("/genie_list", list);
        db.push("/genie_updated_at", new Date());

      } else {
        db.push("/genie_list", "error");
        db.push("/genie_updated_at", new Date());
      }
    })
  }else{
    console.log("not updated")
  }
}

// 음원 순위 조회
exports.getList = function(req, res, next){

  var db_data = null;

  if(fs.readFileSync(db_path, 'utf-8')!=""){

    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'));

    return db_data.genie_list;

  }else{ return "list not saved yet" }
}

// 음원 상세 저장
exports.setDetail = function(req, res, next){

  var db_data = null;
  var list = null;

  if(fs.readFileSync(db_path, 'utf-8')!=""){

    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'));
    if(Object.keys(db_data).includes("genie_list")){
      list = db_data.genie_list;
    }else{ return "list not saved yet" }
  }else{
    return "list not saved yet"
  }

  for (var i=0;i<list.length;i++) {
    (function(i){ 
      var _url = url_detail + list[i].albumNo
      // if(Object.keys(req).includes("url")){
      //  url = req.url + list[i].albumNo
      // } 
      var musicId = list[i].musicId
      request(_url, function (error, response, html) {

        var detail = new Object();
      
        if (!error) {
      
          var $ = cheerio.load(html);
      
          $('.list-wrap > tbody > .list').each(function () {
      
            detail.publisher = $('.info-data').children('li').eq(2).children('.value').text();
            detail.agency = $('.info-data').children('li').eq(3).children('.value').text();
  
          })
        } else {
          detail.error = new Date();
        }
        db.push("/detail/" + musicId, detail)
      })
    })(i);
  }
}

// 음원 상세 조회
exports.getDetail = function(req, res, next){

  var db_data = null;
  var exist = false;
  if(fs.readFileSync(db_path, 'utf-8')!=""){
    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'));
    if(Object.keys(db_data).includes("detail")){ exist = true; }
  }else{ return "detail not saved yet" }
  
  if(exist){

    var musicId = req.musicId;

    if(Object.keys(db_data.detail).includes(musicId)){
      
      return db_data.detail[musicId]

    }else{
      return "detail not saved yet"
    }
  }
}

// 음원 상세 순위 조회
exports.getDetailList = function(req, res, next){

  var db_data = null;
  if(fs.readFileSync(db_path, 'utf-8')!=""){
    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'));
    if(!Object.keys(db_data).includes("genie_list")){
      return "list not saved yet" 
    }
  }else{ return "list not saved yet" }
  
  var list = db_data.genie_list;
  var detail = db_data.detail;
  var detail_list = new Array();
  
  for(var i=0;i<list.length;i++){
    if(Object.keys(detail).includes(list[i].musicId)){
      
      detail_list.push(Object.assign(list[i], detail[list[i].musicId]))

    }else{
      detail_list.push(list[i])
    }
  }
  return detail_list;
}