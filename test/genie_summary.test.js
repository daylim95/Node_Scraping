const genie = require('../music-chart/genie.js')

function genieSummary(){
    new Promise((resolve, reject) =>{
        genie.setList()
    }).then(console.log(genie.getList()))
}

test("지니음원순위조회", ()=>{
    genieSummary()
})