const base64url = require('base64url');

exports.setResponse = function(req, res){
  res.json(req.result);
}

exports.setMusicId = function(name_artist){

  var id = name_artist.replace(/(\s*)/g, "");

  return base64url(id);
}

exports.melonAlbumNo = function(str){
  
  if(str!=undefined){
    str = str.replace("javascript:melon.link.goAlbumDetail('","");
    str = str.replace("');","");
  }

  return str;
}