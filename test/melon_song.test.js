const melon = require('../music-chart/melon.js')

function melonSong(req){
    new Promise((resolve, reject) =>{
        melon.setDetail()
    }).then(console.log(melon.getDetail(req)))
}

var req1 = { "musicId" : "67SE7Jes66aE6rCA7J2E6rKo7Jq4KFN0aWxsTGlmZSlfQklHQkFORyjruYXrsYUp" }
var req2 = { "musicId" : "VE9NQk9ZXyjsl6zsnpAp7JWE7J2065Ok" }
var req3 = { "musicId" : "wrong id" }

test("멜론음원상세조회", ()=>{
    melonSong(req1)
})

test("멜론음원상세조회", ()=>{
    melonSong(req2)
})

test("멜론음원상세조회(잘못된 musicId)", ()=>{
    melonSong(req3)
})