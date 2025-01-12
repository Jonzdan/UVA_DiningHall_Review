const express = require('express');
const router = express.Router();
const ohillSchema = require('../../models/ohill');
const { csrf } = require('../../auth');
const { DiningHallDataParser } = require('../../helper/scraper');
const ohillDiningHallDataParser = new DiningHallDataParser(
    'https://virginia.campusdish.com/LocationsAndMenus/ObservatoryHillDiningRoom',
    ohillSchema,
)


router.get('/', async(req, res) => {
    try {
        let curDate = ohillDiningHallDataParser.getCurDateAsString();
        let ohillTimeFrame = getOhillTimeFrame(new Date().getDay(), ohillDiningHallDataParser.getCurHour());
        let data = await ohillSchema.find(
            {
                activeDate: {
                    $in : [curDate],
                },
                'item.timeFrame': ohillTimeFrame,
            },
            {
                _id:                           0,
                "item.itemReview.reviews":     0,
                "item.itemReview.starsLength": 0,
                activeDate:                    0,
            }
        ).sort({
            "item.itemReview.starsLength": -1,
        });
        if (!data) {
            res.status(500).end("Error querying data");
            return;
        }
        if (data.length === 0) {
            await ohillDiningHallDataParser.getData(ohillSchema);
            data = await ohillSchema.find(
                {
                    activeDate: {
                        $in : [curDate],
                    },
                    'item.timeFrame': ohillTimeFrame,
                },
                {
                    _id:                           0,
                    "item.itemReview.reviews":     0,
                    "item.itemReview.starsLength": 0,
                    activeDate:                    0,
                }
            ).sort({
                "item.itemReview.starsLength": -1,
            });
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({
            msg: err.msg
        });
    }
})

router.post('/', csrf, async (req, res) => {
    const dataObj = req.body;
    try {
        const date = ohillDiningHallDataParser.getCurDateAsString();
        const time = getOhillTimeFrame(new Date().getDay(), ohillDiningHallDataParser.getCurHour());
        if (dataObj["Content"].length < 50 || dataObj["Content"] === undefined || dataObj["APP-STARS"] <= 0 || dataObj["APP-STARS"] > 5) {
            res.status(400).json({
                msg: "unknown parameters"
            });
            return;
        }
        const result = await ohillSchema.findOneAndUpdate(
            {
                stationName:     dataObj.stationName,
                activeDate:      date,
                "item.timeFrame": {
                    $in: [time]
                },
                "item.itemName": dataObj.itemName,
                "item.itemDesc": dataObj.itemDesc,
            },
            {
                $push: {
                    "item.itemReview.stars":   dataObj['APP-STARS'],
                    "item.itemReview.reviews": dataObj['Content']
                },
                $inc: {
                    "item.itemReview.starsLength": 1
                }
            },
            {
                returnOriginal: false
            }
        );
        res.json("Updated");  // Will not touch for simplicity purposes
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            msg: err.msg
        });
    }
})

function getOhillTimeFrame(date, time) {
    return ohillDiningHallDataParser.getDiningHallTimeFrame(date, time);
}


module.exports = router;