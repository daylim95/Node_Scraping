const genie = require('../music-chart/genie.js')

function genieSong(req){
    new Promise((resolve, reject) =>{
        genie.setDetail()
    }).then(console.log(genie.getDetail(req)))
}

var req1 = { "musicId" : "67SE7Jes66aE6rCA7J2E6rKo7Jq4KFN0aWxsTGlmZSlfQklHQkFORyjruYXrsYUp" }
var req2 = { "musicId" : "VE9NQk9ZXyjsl6zsnpAp7JWE7J2065Ok" }
var req3 = { "musicId" : "wrong id" }

test("지니음원상세조회", ()=>{
    genieSong(req1)
})

test("지니음원상세조회", ()=>{
    genieSong(req2)
})

test("지니음원상세조회(잘못된 musicId)", ()=>{
    genieSong(req3)
})