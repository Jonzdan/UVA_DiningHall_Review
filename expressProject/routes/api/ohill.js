const express = require('express');
const router = express.Router();
const ohillSchema = require('../../models/ohill');
const axios = require('axios');
const { csrf } = require('../../auth');

const ohillStations = { //tentative -- seems to change
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
};

//22876 is for breakfast UMAMI....
//22868/22867 change for lunch/dinner (only ironskillet for breakrfast, then it is both)

router.get('/', async(req, res) => {
    try {
        let curDate = getCurDateAsString();
        let ohillTimeFrame = getOhillTimeFrame(new Date().getDay(), getCurHour());
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
            res.status(500).end();
            return;
        }
        if (Object.keys(data).length === 0) {
            await getData();
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
        const date = getCurDateAsString();
        const time = getOhillTimeFrame(new Date().getDay(), getCurHour());
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

/** 
 * Replaces unicode \\u0026 and \\u0027 with & and ' respectively for web content.
*/
function removeSpecialChar(string) {
    if (!string) {
        return string;
    }
    return string.replace(/\\u0026/g, '&').replace(/\\u0027/g, "'");
}

function getCurDateAsString() {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function getCurHour() {
    let hour = new Date().getHours().toString();
    if (hour.length === 1) {
        hour = '0' + hour;
    }
    return hour;
}

function getOhillTimeFrame(date, time) {
    if (date === 0 || date === 6) {
        if (time >= 800 && time < 1415) {
            return 'Brunch (8am-2:15pm)';
        }
        if (time < 800 || time >= 2000) {
            return 'Unavailable'; 
        }
    }
    if (time >= 700 && time < 1100) {
        return 'Breakfast (7am-11am)';
    } else if (time >= 1100 && time < 1415) {
        return 'Lunch (11am-2:15pm)';
    } else if (time >= 1415 && time < 1700) {
        return 'Afternoon Snack (2:15pm-5pm)';
    } else if (time >= 1700 && time < 2000) {
        return 'Dinner (5pm-8pm)';
    } else {
        return 'Unavailable';
    }
}

function getFoodProducts(data) {
    let iterator = 0;
    const foodProducts = [];
    while (iterator < data.length) {
        const newProductIndex = data.indexOf('"Product":', iterator);

        if (newProductIndex === -1) {
            break;
        }

        const newStationIdIndex = data.indexOf('"StationId":', iterator) + 13;
        const endOfNewStationIdIndex = data.indexOf('"', newStationIdIndex);
        const newStationId = data.slice(newStationIdIndex, endOfNewStationIdIndex);

        const startOfNewProductIndex = data.indexOf('"Product":{', endOfNewStationIdIndex);
        const startOfMarketingNameIndex = data.indexOf("MarketingName", startOfNewProductIndex) + 16;
        const endOfMarketingNameIndex = data.indexOf('"', startOfMarketingNameIndex);
        const newMarketingName = removeSpecialChar(data.slice(startOfMarketingNameIndex, endOfMarketingNameIndex));

        const startOfShortDescriptionObjectIndex = data.indexOf("ShortDescription", endOfMarketingNameIndex + 1);
        const startOfShortDescriptionIndex = data.indexOf('"', startOfShortDescriptionObjectIndex + 18) + 1;
        const endOfShortDescriptionIndex = data.indexOf('"', startOfShortDescriptionIndex + 3);
        const newShortDescription = removeSpecialChar(data.slice(startOfShortDescriptionIndex, endOfShortDescriptionIndex));

        foodProducts.push({
            stationId:        newStationId,
            marketingName:    newMarketingName,
            shortDescription: newShortDescription,
        });

        itemNames.add(newMarketingName);

        iterator = endOfShortDescriptionIndex + 1;
    }
    return foodProducts;
}

/**
 * 
 * @param {*} data
 * @param {*} existingFoodProductsMapping
 * A Map Object of Key: `${item.itemName}-${stationName}`, Value: { MongoDB Document Item }
 * @param {*} curDate 
 * @param {*} timeFrame 
 * @param {*} stationMapping 
 * @returns An array of MongoDB write operations
 */
function bulkProcessFoodProducts(data, existingFoodProductsMapping, curDate, timeFrame, stationMapping) {
    const foodProducts = getFoodProducts(data);
    const bulkOperations = [];
    for (const products of foodProducts) {
        const { stationId, marketingName, shortDescription } = products;
        const existingProduct = existingFoodProductsMapping.get(`${products.item.itemName}-${products.stationName}`)

        if (existingProduct) {
            bulkOperations.push({
                updateOne: {
                    filter: {
                        _id: existingProduct._id,
                    },
                    update: {
                        $push: {
                            activeDate: curDate,
                        }
                    },
                }
            });
        } else {
            if (!(stationId in stationMapping)) {
                console.log(`${stationId} is unknown`);
                return;
            }

            const stationProduct = {
                stationName: stationMapping[stationId],
                item: {
                    itemName:  marketingName,
                    itemDesc:  shortDescription,
                    timeFrame: timeFrame,
                    itemReview: {
                        stars:       [],
                        starsLength: 0
                    }
                },
                activeDate: [curDate]
            };

            if (stationProduct && stationProduct.item.timeFrame !== 'Unavailable') {
                bulkOperations.push({
                    insertOne: {
                        document: stationProduct,
                    }
                });
            }
        }
    }
    return bulkOperations;
}

async function getData() { //figure out a faster way --> perhaps load only 3, then lazy load the rest?
    const res = await axios.get('https://virginia.campusdish.com/LocationsAndMenus/ObservatoryHillDiningRoom');
    const curDate = getCurDateAsString().trim();
    const timeFrame = getOhillTimeFrame(new Date().getDay(), getCurHour());
    const itemNames = new Set();
    const existingFoodProductsMapping = new Map();

    const existingFoodProducts = await ohillSchema.find({
        "item.timeFrame": timeFrame,
        stationName: {
            $in: Object.values(ohillStations),
        },
        "item.itemName": {
            $in: [...itemNames],
        }
    });

    for (const product of existingFoodProducts) {
        existingFoodProductsMapping.set(
            `${product.item.itemName}-${product.stationName}`,
            product,
        );
    }

    bulkOperations = bulkProcessFoodProducts(res.data, existingFoodProductsMapping, curDate, timeFrame, ohillStations);

    if (bulkOperations.length > 0) {
        try {
            ohillSchema.bulkWrite(bulkOperations);
        } catch (error) {
            console.error("Bulk write failed:", error)
        }
    }
}

module.exports = router;