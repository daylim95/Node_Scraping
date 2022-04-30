const melon = require('../music-chart/melon.js')

function melonSummary(){
    new Promise((resolve, reject) =>{
        melon.setList()
    }).then(console.log(melon.getList()))
}

test("멜론음원순위조회", ()=>{
    melonSummary()
})