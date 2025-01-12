const express = require('express')
const router = express.Router()
const runkSchema = require('../../models/runk')
const { csrf } = require('../../auth');
const { RunkDataParser } = require('../../helper/runkScraper');

const runkParser = new RunkDataParser(
    'https://virginia.campusdish.com/en/locationsandmenus/runk/',
    runkSchema,
);

router.get('/', async (req, res) => {
    try {
        const date = runkParser.getCurDateAsString();
        const time = runkParser.getDiningHallTimeFrame(new Date().getDay(), RunkDataParser.getCurHour());
        const data = await runkSchema.find(
            {
                activeDate: {
                    $in : [date],
                },
                'item.timeFrame': time,
            },
            {
                _id: 0,
            }
        ).sort({
            "item.itemReview.starsLength": -1,
        });

        if (data.length === 0) {
            await runkParser.getData(runkSchema);
            const newData = await runkSchema.find(
                {
                    activeDate: {
                        $in : [date],
                    },
                    'item.timeFrame': time,
                },
                {
                    _id: 0,
                }
            ).sort({
                "item.itemReview.starsLength": -1,
            });

            res.json(newData);
        }
        else {
            res.json(data);
        }
    }
    catch (err) {
        // *TODO* Update to generic error message when finished testing
        res.status(500).json({
            msg: err.msg,
        });
    }
}).post('/', csrf, async (req, res) => {
    const dataObj = req.body;
    try {
        const date = runkParser.getCurDateAsString();
        const time = runkParser.getDiningHallTimeFrame(new Date().getDay(), runkParser.getCurHour());
        if (dataObj["Content"].length < 50 || dataObj["Content"] === undefined || dataObj["APP-STARS"] <= 0 || dataObj["APP-STARS"] > 5) {
            res.status(400).json({
                msg: "unknown parameters",
            });
            return;
        }
        const result = await runkSchema.findOneAndUpdate(
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
        console.log(err);
        res.status(503).json({msg: err.msg})
    }
})


module.exports = router;
