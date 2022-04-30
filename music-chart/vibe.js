const cheerio = require('cheerio')
const request = require('request')
const common = require('./common.js')
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome'); 
const { By } = require('selenium-webdriver'); 
const fs = require('fs')
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const db_path = "../db/db.json"
const db = new JsonDB(new Config(db_path, true, false, '/'));

const url = "https://vibe.naver.com/chart/total/#";
const url_detail = "https://vibe.naver.com/album/";

// 음원 순위 저장
exports.setList = function(req, res, next){
  
  var db_data = null;
  var token = true;

  // 데이터가 없거나 업데이트 시간이 30분이 지난 경우에만 조회하도록 함
  if(fs.readFileSync(db_path, 'utf-8')!=""){
    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'))
    if(Object.keys(db_data).includes("vibe_updated_at")){
      var updated = new Date(db_data.vibe_updated_at);
      if((new Date().getTime() - updated.getTime()) < (1000*60) * 0.1){
        token = false;
      }
    }
  }else{ fs.writeFileSync(db_path, "{}") }

  if(token){

    var list = new Array();

    const run = async () => { 
      
      const service = new chrome.ServiceBuilder('./chromedriver').build(); 
      chrome.setDefaultService(service); 
      const driver = await new webdriver.Builder().forBrowser('chrome').build(); 
      await driver.get(url); 

      // 선택자를 사용하여 음원 순위 정보 획득
      /* $('.tracklist tr').each(function () {
    
        var song = new Object();
  
        song.ranking = $(this).find('').text().trim();
        song.name = $(this).find('').text().trim();
        song.singer = $(this).find('').text().trim();
        song.album = $(this).find('').text().trim();
        song.albumNo = $(this).find('')text().trim();
        song.musicId = common.setMusicId(song.name + '_' + song.singer);

        list.push(song);
      })

      db.push("/vibe_list", list);
      db.push("/vibe_updated_at", new Date()); */

      setTimeout(
        async () => { 
          await driver.quit(); process.exit(0); 
        }, 3000); 
    }

    run();
  }
}

// 음원 순위 조회
exports.getList = function(req, res, next){

  var db_data = null;

  if(fs.readFileSync(db_path, 'utf-8')!=""){

    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'));

    return db_data.vibe_list;

  }else{ return "list not saved yet" }
}

// 음원 상세 저장
exports.setDetail = function(req, res, next){

  var db_data = null;
  var list = null;

  if(fs.readFileSync(db_path, 'utf-8')!=""){

    db_data = JSON.parse(fs.readFileSync(db_path, 'utf-8'));
    if(Object.keys(db_data).includes("vibe_list")){
      list = db_data.vibe_list;
    }else{ return "list not saved yet" }
  }else{
    return "list not saved yet"
  }

  for (var i=0;i<list.length;i++) {
    
    (function(i){ 
      var _url = url_detail + list[i].albumNo
      
      var musicId = list[i].musicId

      var detail = new Object();
      
      const run = async () => { 
    
        const service = new chrome.ServiceBuilder('./chromedriver').build(); 
        chrome.setDefaultService(service); 
        const driver = await new webdriver.Builder().forBrowser('chrome').build(); 
        await driver.get(url_detail + musicId); 
  
        // 선택자를 사용하여 음원 순위 정보 획득
        /* $('html').each(function () {
            
          detail.publisher = $(this).find('')text().trim();
          detail.agency = $(this).find('')text().trim();

        })*/
  
        setTimeout(
          async () => { 
            await driver.quit(); process.exit(0); 
          }, 1000); 
      }
      db.push("/detail/" + musicId, detail)

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
    if(!Object.keys(db_data).includes("vibe_list")){
      return "list not saved yet" 
    }
  }else{ return "list not saved yet" }
  
  var list = db_data.vibe_list;
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