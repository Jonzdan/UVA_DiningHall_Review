const express = require('express')
const router = express.Router()
const newcombSchema = require('../../models/newcomb')
const axios = require('axios')

const newcombstations = {
    "16503": "Vegan Bar",
    "16502": "Salad Bar",
    "16507": "Cools Food Sandwich",
    "16504": "Grill",
    "16508": "Pizza",
    "16506": "Delicious Destinations", 
    "16509": "Vegan",
    "16510": "Pasta",
    "24938": "Entree",
    "41285": "Smoke House",
    "24939": "Soup",
    "16526": "Copper Hood"
}

router.get('/', async (req, res) => {
    try {
        let date = getCurDateAsString()
        let time = getNewcombTimeFrame()
        const data = await newcombSchema.find( { activeDate: { $in: [ date ]} , 'item.timeFrame': time}, {_id: 0} )
        if (data && Object.keys(data).length === 0) {
            let bol = await getData()
            let data1 = await newcombSchema.find( {activeDate: { $in: [date]}, 'item.timeFrame': time}, {_id: 0})
            res.json(data1)
        }
        else {
            //
            res.json(data)
        }
        
    }
    catch (err) {
        res.status(500).json({msg: err.msg})
    }
}).post('/', async (req, res) => {
    try {
        console.log('received')
    }
    catch (err) {
        res.status(501).json({msg: err.msg})
    }
})


function getNewcombTimeFrame() {
    let today = new Date().getDay()
    let time = getCurHour()
    //logic here...
    if (today == 6) {
        return "Closed"
    }
    else if (today == 5) {
        if (time >= 0700 && time < 1030) {
            return "Breakfast (7am-10:30am)"
        }
        else if (time >= 1100 && time < 1400) {
            return "Lunch (11am-2pm)"
        }
        else {
            return "Unavailable"
        }
    }
    
    else {
        if (today == 0) {
            if (time >= 1000 && time < 1400) {
                return "Brunch (10am-2pm)"
            }
        }
        if (time >= 0700 && time < 1030) {
            return "Breakfast (7am-10:30am)"
        }
        else if (time >= 1100 && time < 1400) {
            return "Lunch (11am-2pm)"
        }
        else if (time >= 1400 && time < 1700) {
            return "Afternoon Snack (2pm-5pm)"
        }
        else if (time >= 1700 && time < 2000 ) {
            return "Dinner (5pm-8pm)"
        }
        else {
            return "Unavailable"
        }
    }
}


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

//fix code later -- dont slice data,.
async function getData() {
    axios.get('https://virginia.campusdish.com/LocationsAndMenus/FreshFoodCompany')
    .then(res => {
        //console.log(res.data.slice(100000,250000))
        const ind = res.data.indexOf("model")
        const endInd = res.data.indexOf("/Cart", ind) + 8 //looks like MarketingName, and ShortDescription, DisplayName (Entrees...), isActive... and more like Contains Fish or whatnot
        let data = res.data.slice(ind, endInd)
        let iterator = ind
        let curDate = getCurDateAsString()
        while (data.indexOf('"Product":', iterator) !== -1 && iterator < data.length) {
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
            newcombSchema.find({ item: { itemName: resultString }}, (err, res) => {
                if (err) throw err
                if (res && Object.keys(res).length !== 0 && res.activeDate[res.activeDate.length-1] != curDate && res.item.timeFrame != getNewcombTimeFrame()) {
                    newcombSchema.updateOne({ _id: res._id}, {$push: {activeDate: curDate}})
                }
                else {
                    const obj = {
                        stationName: newcombstations[stationId],
                        item: {
                            itemName: resultString,
                            itemDesc: descriptionString,
                            timeFrame: getNewcombTimeFrame()
                        },
                        activeDate: [curDate]
                    }
                    if (obj && obj.item.timeFrame !== 'Unavailable') {
                        let newcomb1 = new newcombSchema(obj)
                        newcomb1.save()
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