const express = require('express')
const router = express.Router()
const ohillSchema = require('../../models/ohill')
const axios = require('axios')

const ohillstations = { //tentative -- seems to change
    "22869": "Copper Hood",
    "22868": "The Iron Skillet", //Was also Umami
    "22867": "The Iron Skillet", //was Umami/Stir-Fry
    "22871": "Trattoria - Pizza",
    "22866": "Under the Hood",
    "22878": "Trattoria - Pasta",
    "24536": "Soups",
    "22870": "Green Fork",
    "22873": "Greens & Grains",
    "22875": "Greens & Grains",
    "22872": "Savory Stack",
    "39894": "Hummus Vegetable Wrap",
    "22876": "Umami"
}

//22876 is for breakfast UMAMI....
//22868/22867 change for lunch/dinner (only ironskillet for breakrfast, then it is both)

router.get('/', async(req, res) => {
    try {
        let date = getCurDateAsString()
        let time = getOhillTimeFrame(new Date().getDay(), getCurHour())
        const data = await ohillSchema.find( { activeDate: {$in : [date]}, 'item.timeFrame': time}, {_id: 0})
        if (data && Object.keys(data).length === 0) {
            await getData() //prob have to await the callback
            const data1 = await ohillSchema.find( { activeDate: {$in : [date]}, 'item.timeFrame': time}, {_id: 0})
            res.json(data1)
        }
        else {
            res.json(data)
        }

    }
    catch (err) {
        res.status(500).json({msg: err.msg})
    }
})

router.post('/', async (req, res) => {
    const dataObj = req.body
    try { //add validation later
        let date = getCurDateAsString(); let time = getOhillTimeFrame(new Date().getDay(), getCurHour())
        if (dataObj["Content"].length < 50 || dataObj["Content"] === undefined || dataObj["APP-STARS"] <= 0 || dataObj["APP-STARS"] > 5) { res.status(400).json({msg: "unknown parameters"}); return }
        const temp = await ohillSchema.findOneAndUpdate({stationName: dataObj.stationName, activeDate: date, "item.timeFrame": {$in: [time]}, "item.itemName": dataObj.itemName, "item.itemDesc": dataObj.itemDesc}, {$push: {"item.itemReview.stars": dataObj['APP-STARS'], "item.itemReview.reviews":dataObj['Content']}}, {returnOriginal: false})
        //console.log("TEMP: \n", temp)
        res.json("Updated")
    }
    catch (err) {
        console.log(err)
        res.status(503).json({msg: err.msg})
    }
})


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

function getOhillTimeFrame(date, time) {
    if (date == 0 || date == 6) { //sat or sun
        if (time >= 1100 && time < 1400) {
            return 'Brunch (8am-2:15pm)'
        }
        else if (time >= 1700 && time < 2000 ) {
            return 'Dinner (5pm-8pm)'
        }
        else if (time >= 1415 && time < 1700) {
            return 'Afternoon Snack (2:15pm-5pm)'
        }
        else {
            return 'Unavailable'
        }
    }
    else {
        if (time >= 0700 && time < 1100) {
            return 'Breakfast (7am-11am)'
        }
        else if (time >= 1100 && time < 1415) {
            return 'Lunch (11am-2:15pm)'
        }
        else if (time >= 1415 && time < 1700) {
            return 'Afternoon Snack (2:15pm-5pm)'
        }
        else if (time >= 1700 && time < 2000) {
            return 'Dinner (5pm-8pm)'
        }
        else {
            return 'Unavailable'
        }
    }
}

async function getData() {
    axios.get('https://virginia.campusdish.com/LocationsAndMenus/ObservatoryHillDiningRoom')
    .then(res => {
        //console.log(res.data.slice(80000,200000))
        //const ind = res.data.indexOf("model")
        const endInd = res.data.indexOf("/Cart") + 8 //looks like MarketingName, and ShortDescription, DisplayName (Entrees...), isActive... , Product":{ and more like Contains Fish or whatnot
        //let data = res.data.slice(ind, endInd)
        let data = res.data
        let iterator = 0 //or ind
        let curDate = getCurDateAsString().trim()
        const size = data.length;
        while (data.indexOf('"Product":', iterator) !== -1 && iterator < size) {
            let shopId = data.indexOf('"StationId":', iterator) + 13
            let end = data.indexOf('"', shopId)
            let stationId = data.slice(shopId, end)
            let start = data.indexOf('"Product":{', end)
            let mn = data.indexOf("MarketingName", start) + 16
            let mne = data.indexOf('"', mn)
            let resultString = data.slice(mn, mne)
            let begin = data.indexOf("ShortDescription", mne+1)
            begin = data.indexOf('"', begin + 18) + 1
            let sde = data.indexOf('"', begin+3)
            let descriptionString = data.slice(begin, sde)
            descriptionString = removeSpecialChar(descriptionString)
            resultString = removeSpecialChar(resultString)
            //* There potentially could be an error in adding to existing ones* fixed** 
            ohillSchema.find({ "item.itemName" : resultString, "item.timeFrame": getOhillTimeFrame(curDate, getCurHour()), "stationName" : ohillstations[stationId]}, (err, res) => {
                if (err) throw err
                //console.log(resultString, stationId, ohillstations[stationId])
                const objLength = Object.keys(res).length
                if (res != undefined && res != null && objLength !== 0 && res[objLength-1].activeDate[res[objLength-1].activeDate.length-1]) {
                    ohillSchema.updateOne({_id: res[objLength-1]._id, "item.timeFrame" : getOhillTimeFrame(curDate, getCurHour())}, {$push: {activeDate: curDate}}, (err, res ) => {
                        if (err) console.error(err)
                    })
                }
                else {
                    if (!(stationId in ohillstations)) { /* We should audit this, and then stop the process */ return }
                    const obj = {
                        stationName: ohillstations[stationId],
                        item: {
                            itemName: resultString,
                            itemDesc: descriptionString,
                            timeFrame: getOhillTimeFrame(curDate, getCurHour())
                        },
                        activeDate: [curDate]
                    }
                    if (obj && obj.item.timeFrame !== 'Unavailable') {
                        let ohill1 = new ohillSchema(obj)
                        ohill1.save()
                    }
                    
                }
            })
            iterator = sde + 1
        }
       //console.log(currentOhillDiningOptions)
    return true
    }).catch(err => console.error(err))


}

module.exports = router