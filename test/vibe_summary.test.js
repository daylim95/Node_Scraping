const vibe = require('../music-chart/vibe.js')

function vibeSummary(){
    new Promise((resolve, reject) =>{
        vibe.setList()
    }).then(console.log(vibe.getList()))
}

test("바이브음원순위조회", ()=>{
    vibeSummary()
})