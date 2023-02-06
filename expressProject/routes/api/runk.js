const express = require('express')
const router = express.Router()
const runkSchema = require('../../models/runk')
const axios = require('axios')

//lets say ... is temp data

function removeSpecialChar(s) {
    if (!(s)) {
        return
    }
    if (s.indexOf("\\u0026") != -1) {
        let first = s.indexOf("\\u0026")
        let end = first + 7
        s = s.slice(0, first) + '& ' + s.slice(end)
    }
    if (s.indexOf("\\u0027") != -1) {
        let first = s.indexOf("\\u0027")
        let end = first + 7
        s = s.slice(0, first) + "'" + s.slice(end)
    }

    return s
}

router.get('/', async (req, res) => {
    res.header('Access-Control-Allow-Methods', "GET, POST, PUT, OPTIONS")
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept") 
    try {
        let date = getCurDateAsString()
        let time = getRunkTimeFrame(getCurHour())
        const data = await runkSchema.find( { activeDate: { $in: [ date ]} , 'item.timeFrame': time}, {_id: 0} )
        if (data && Object.keys(data).length === 0) {
            await getData()
            let data1 = await runkSchema.find( {activeDate: { $in: [date]}, 'item.timeFrame': time}, {_id: 0})
            res.json(data1)
        }
        else {
            //
            res.json(data)
        }
        
    }
    catch (err) {
        console.log(err)
        res.status(500).json({msg: err.msg})
    }
}).post('/', async (req, res) => {
    const dataObj = req.body
    try { //add validation later
        let date = getCurDateAsString(); let time = getRunkTimeFrame(getCurHour())
        if (dataObj["Content"].length < 50 || dataObj["Content"] === undefined || dataObj["APP-STARS"] <= 0 || dataObj["APP-STARS"] > 5) { res.status(400).json({msg: "unknown parameters"}); return }
        const temp = await runkSchema.findOneAndUpdate({stationName: dataObj.stationName, activeDate: date, "item.timeFrame": {$in: [time]}, "item.itemName": dataObj.itemName}, {$push: {"item.itemReview.stars": dataObj['APP-STARS'], "item.itemReview.reviews":dataObj['Content']}}, {returnOriginal: false})
        //console.log("TEMP: \n", temp)
        res.json("Updated")
    }
    catch (err) {
        console.log(err)
        res.status(503).json({msg: err.msg})
    }
})


function checkRunkTimeFrame(num) {
    bol = true;
    if (num > 2000 && num < 2100) {
        bol = false
    }
    else if (num > 0000 && num < 0700) {
        bol = false
    }
    return bol;
}

function getCurDateAsString() {
    const a = new Date()
    let month = (a.getMonth() + 1).toString()
    if (month.length === 1) {
        month = '0' + month
    }
    let day = a.getDate().toString()
    if (day.length === 1) {
        day = '0' + day
    }
    let year = a.getFullYear().toString()
    let val = year+month+day
    return val
}

function getCurHour() {
    const a = new Date().toString()
    let start = a.indexOf(":")-2
    let se = start + 2
    let ss = se + 1
    let sse = ss + 2
    return a.slice(start, se) + a.slice(ss, sse)
}


//this currently webscrapes the wrong infomation.
async function getData() {
    axios.get("https://harvesttableuva.com/locations/runk-dining-hall/") //looks like when it comes to late night, it goes to tmrw
    .then(res => {
    //class toggle-menu-station-data is names
    d = {} 
    let time = getCurHour()
    l = []
    //check if dinner, if so, then we need to get late dinner as well
    
    let activeTime = res.data.indexOf(`<div class="c-tab is-active">`) //this is what we want...
    if (!checkRunkTimeFrame(time) || activeTime == -1) {
        activeTime = -1
    }
    if (activeTime == -1) { //not a valid time
        //send invalid...
    }
    else {
        let endTime = res.data.indexOf('<div class="c-tab">', activeTime+100)
        if (endTime == -1) { //meaning its the last one
            endTime = res.data.length
        }
        i = activeTime
        //console.log(activeTime, endTime)
        while (res.data.indexOf(`<h4 class="toggle-menu-station-data"`, i) != -1 && res.data.indexOf(`<h4 class="toggle-menu-station-data"`, i) < endTime) {
            let f = res.data.indexOf(`<h4 class="toggle-menu-station-data"`, i)
            let greaterthan = res.data.indexOf(">", f)
            let lessthan = res.data.indexOf("</h4>", greaterthan+1)
            let name = res.data.slice(greaterthan+1, lessthan)
            let nextNameStart = res.data.indexOf(`<h4 class="toggle-menu-station-data"`, f + 100)
            if (nextNameStart === -1) {
                nextNameStart = res.data.length
            }
            let iterator = lessthan
            while (res.data.indexOf(`<li class="menu-item-li`, iterator) !== -1 && res.data.indexOf(`li class="menu-item-li`, iterator+1) < nextNameStart) {
                //let start = res.data.indexOf("menu-item-li", iterator)
                let begin = res.data.indexOf(`<a href="#" class="show-nutrition`, iterator+1)
                let itemStart = res.data.indexOf(`">`, begin) + 2
                let end = res.data.indexOf(`</a>`, itemStart + 1)
                let itemNames = res.data.slice(itemStart, end)
                itemNames = removeSpecialChar(itemNames)
                let val = getCurDateAsString().trim()
                runkSchema.find({"item.itemName" : itemNames, "item.timeFrame": getRunkTimeFrame(getCurHour()), "stationName" : name}, (err, res) => {
                    if (err) throw err
                    const objLength = Object.keys(res).length
                    try {
                        if (res != undefined && res != null && objLength !== 0 && res[objLength-1] != undefined && res[objLength-1].activeDate[res[objLength-1].activeDate.length-1] !== val) {
                             //console.log(res[objLength-1].activeDate[res[objLength-1].activeDate.length-1], val, itemNames, res[objLength-1]._id )
                             runkSchema.updateOne( {_id: res[objLength-1]._id, "item.timeFrame" : getRunkTimeFrame(time)}, {$push: { activeDate: val}}, (err, res) => { if (err) { console.error(err) } })
                        
                        }
                        else {
                            const saveobj = {
                                stationName: name,
                                item: {
                                    itemName: itemNames,
                                    timeFrame: getRunkTimeFrame(time)
                                },
                                activeDate: [val]
                            }
                            if (saveobj && saveobj.item.timeFrame !== 'Unavailable') {
                                let runk1 = new runkSchema(saveobj)
                                runk1.save()
                            }
                            
                        }
                    }
                    catch (err0r) {
                        console.log(err0r)
                        console.log(res[0])
                    }
                    
                })                 
                iterator = end+4

                } 
            i = nextNameStart
            
            //res.data = res.data.slice(lessthan+1)
        }

        }
    
        //console.log(d)
        //loop thru and follow model
    if (getRunkTimeFrame(time) === 'Dinner (4:30pm-8pm)') {
        let b = res.data.indexOf("c-tab")
        b = res.data.indexOf("c-tab", b+10)
        b = res.data.indexOf("c-tab", b+10)
        b = res.data.indexOf("c-tab", b +10)
        let endTime = res.data.indexOf('class="bound-layout"')
        let i = b
        while(res.data.indexOf("toggle-menu-station-data", i) < endTime) {
            let f = res.data.indexOf("toggle-menu-station-data", i)
            let greaterthan = res.data.indexOf(">", f)
            let lessthan = res.data.indexOf("<", greaterthan+1)
            let name = res.data.slice(greaterthan+1, lessthan)
            if (l.indexOf(name) == -1) {
                let nextNameStart = res.data.indexOf("toggle-menu-station-data", f + 10)
                if (nextNameStart === -1) {
                    nextNameStart = res.data.length
                }
                let iterator = lessthan
                while (res.data.indexOf("menu-item-li", iterator) != -1 && res.data.indexOf("menu-item-li", iterator) < nextNameStart) {
                    let start = res.data.indexOf("menu-item-li", iterator)
                    let end = res.data.indexOf("</a>", start + 1)
                    let temp = res.data.indexOf("tabindex=", start + 1)
                    let itemStart = res.data.indexOf(">", temp + 1) + 1
                    let itemNames = res.data.slice(itemStart, end)
                    itemNames = removeSpecialChar(itemNames)
                    let val = getCurDateAsString()
                    runkSchema.find({"item.itemName" : itemNames, "item.timeFrame": getRunkTimeFrame(2101), "stationName" : name}, (err, res) => {
                        if (err) throw err
                        if (res != undefined && Object.keys(res).length !== 0 && res.activeDate[res.activeDate.length-1] != val) {
                            runkSchema.updateOne( {_id: res._id}, {$push: { activeDate: val}}, (err, res) => {if (err) console.error(err) })
                        }
                        else {
                            const saveobj = {
                                stationName: name,
                                item: {
                                    itemName: itemNames,
                                    timeFrame: getRunkTimeFrame(2101)
                                },
                                activeDate: [val]
                            }
                            let runk1 = new runkSchema(saveobj)
                            runk1.save()
                        }
                    })                 
                    iterator = end+4

                    } 
                i = nextNameStart
            }
        } 
    }    
    })
    
}


function getRunkTimeFrame(num) { //num is time
    let d = new Date().getDay()
    if (d === 0 || d === 6) {
        //brunch 10-2
        if (num >= 1000 && num < 1400) {
            return "Brunch (10am-2pm)"
        }
        //latelunch 2-430
        else if (num >= 1400 && num < 1630) {
            return "Late Lunch (2pm-4:30pm"
        }
        //dinner 430-8
        else if (num >= 1630 && num < 2000) {
            return "Dinner (4:30pm-8pm)"
        }
        //late night 9-12
        else {
            return "Late Night (9pm-12am)"
        }
    }
    else {
        //7-1030 break
        if (num >= 0700 && num < 1030) {
            return "Breakfast (7am-10:30am)"
        }
        //11-2 lunch
        else if (num >= 1100 && num < 1400) {
            return "Lunch (11am-2pm)"
        }
        //2-430 late lunch
        else if (num >= 1400 && num < 1630) {
            return "Late Lunch (2pm-4:30pm)"
        }
        //430-8 dinner
        else if (num >= 1630 && num < 2000) {
            return "Dinner (4:30pm-8pm)"
        }
        //late night grill 9-12
        else {
            return "Late Night Grill (9pm-12am)"
        }
    }
}


module.exports = router
