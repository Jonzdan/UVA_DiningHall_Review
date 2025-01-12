const express = require('express')
const router = express.Router()
const newcombSchema = require('../../models/newcomb')
const { csrf } = require('../../auth');
const { NewcombDataParser } = require('../../helper/newcombScraper');

const newcombParser = new NewcombDataParser('https://virginia.campusdish.com/LocationsAndMenus/FreshFoodCompany', newcombSchema);

router.get('/', async (req, res) => {
    try {
        const date = newcombParser.getCurDateAsString();
        const time = newcombParser.getDiningHallTimeFrame(new Date().getDay(), newcombParser.getCurHour());
        const data = await newcombSchema.find(
            {
                activeDate: {
                    $in : [date],
                },
                'item.timeFrame': time,
            },
            {
                _id: 0,
                "item.itemReview.reviews":     0,
                "item.itemReview.starsLength": 0,
                activeDate:                    0,
            }
        ).sort({
            "item.itemReview.starsLength": -1,
        });
        if (data.length === 0) {
            await newcombParser.getData(newcombSchema);
            const newData = await newcombSchema.find(
                {
                    activeDate: {
                        $in : [date],
                    },
                    'item.timeFrame': time,
                },
                {
                    _id:                           0,
                    "item.itemReview.reviews":     0,
                    "item.itemReview.starsLength": 0,
                    activeDate:                    0,
                }
            ).sort({
                "item.itemReview.starsLength": -1,
            })
            res.json(newData);
        }
        else {
            res.json(data);
        }
        
    }
    catch (err) {
        // *TODO* Update to generic error message when finished testing
        res.status(500).json({
            msg: err.msg
        });
    }
}).post('/', csrf, async (req, res) => {
    const dataObj = req.body;
    try {
        const date = newcombParser.getCurDateAsString();
        const time = newcombParser.getDiningHallTimeFrame(new Date().getDay(), newcombParser.getCurHour());
        if (dataObj["Content"].length < 50 || dataObj["Content"] === undefined || dataObj["APP-STARS"] <= 0 || dataObj["APP-STARS"] > 5) {
            res.status(400).json({
                msg: "unknown parameters",
            });
            return;
        }
        const result = await newcombSchema.findOneAndUpdate(
            {
                stationName: dataObj.stationName,
                activeDate:  date,
                "item.timeFrame": {
                    $in: [time]
                },
                "item.itemName": dataObj.itemName,
                "item.itemDesc": dataObj.itemDesc,
            },
            {
                $push: {
                    "item.itemReview.stars":   dataObj['APP-STARS'],
                    "item.itemReview.reviews": dataObj['Content'],
                },
                $inc: {
                    "item.itemReview.starsLength": 1,
                }
            },
            {
                returnOriginal: false,
            }
        );
        res.json("Updated");
    }
    catch (err) {
        // *TODO* Update to generic error message when finished testing
        res.status(503).json({
            msg: err.msg
        });
    }
})

module.exports = router;