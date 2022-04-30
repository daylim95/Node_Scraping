const vibe = require('../music-chart/vibe.js')

function vibeSong(req){
    new Promise((resolve, reject) =>{
        vibe.setDetail()
    }).then(console.log(vibe.getDetail(req)))
}

var req1 = { "musicId" : "67SE7Jes66aE6rCA7J2E6rKo7Jq4KFN0aWxsTGlmZSlfQklHQkFORyjruYXrsYUp" }
var req2 = { "musicId" : "VE9NQk9ZXyjsl6zsnpAp7JWE7J2065Ok" }
var req3 = { "musicId" : "wrong id" }

test("바이브음원상세조회", ()=>{
    vibeSong(req1)
})

test("바이브음원상세조회", ()=>{
    vibeSong(req2)
})

test("바이브음원상세조회(잘못된 musicId)", ()=>{
    vibeSong(req3)
})