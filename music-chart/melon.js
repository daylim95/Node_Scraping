const cheerio = require('cheerio')
const request = require('request')
const common = require('./common.js')
const fs = require('fs')
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const db_path = "../db/db.json"
const db = new JsonDB(new Config(db_path, true, false, '/'));

const url = 'https://www.melon.com/chart/';
const url_detail = 'https://www.melon.com/album/detail.htm?albumId=';

// 음원 순위 저장
exports.setList = function(req, res, next){
  
  var db_data = null;
  var token = true;

  // 데이터가 없거나 업데이트 시간이 30분이 지난 경우에만 조회하도록 함
  if(fs.readFileSync(db_path, 'utf-8')!=""){
    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'))
    if(Object.keys(db_data).includes("melon_updated_at")){
      var updated = new Date(db_data.melon_updated_at);
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

        $('.service_list_song tr').each(function () {
    
          var song = new Object();
    
          song.ranking = $(this).find('.rank').text().trim();
          song.name = $(this).find('.ellipsis.rank01 a').text().trim();
          song.singer = $(this).find('.checkEllipsis').text().trim();
          song.album = $(this).find('.ellipsis.rank03').text().trim();
          song.albumNo = common.melonAlbumNo($(this).find('.ellipsis.rank03 > a').attr('href'));
          song.musicId = common.setMusicId(song.name + '_' + song.singer);

          list.push(song);
        })

        db.push("/melon_list", list);
        db.push("/melon_updated_at", new Date());

      } else {
        db.push("/melon_list", "error");
        db.push("/melon_updated_at", new Date());
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

    return db_data.melon_list;

  }else{ return "list not saved yet" }
}

// 음원 상세 저장
exports.setDetail = function(req, res, next){

  var db_data = null;
  var list = null;

  if(fs.readFileSync(db_path, 'utf-8')!=""){

    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'));
    if(Object.keys(db_data).includes("melon_list")){
      list = db_data.melon_list;
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
      
          detail.publisher = $('.section_info > .wrap_info').find('.list dd').eq(2).text();
          detail.agency = $('.section_info > .wrap_info').find('.list dd').eq(3).text();

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
    if(!Object.keys(db_data).includes("melon_list")){
      return "list not saved yet" 
    }
  }else{ return "list not saved yet" }
  
  var list = db_data.melon_list;
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