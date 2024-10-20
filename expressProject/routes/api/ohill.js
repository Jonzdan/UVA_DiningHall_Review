const express = require('express');
const router = express.Router();
const ohillSchema = require('../../models/ohill');
const axios = require('axios');
const cheerio = require('cheerio');
const { csrf } = require('../../auth');
const fs = require('fs');

const ohillStations = { //Change to DB to persist data
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
    await getData();
    return;
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
            res.status(500).end("Error querying data");
            return;
        }
        if (data.length === 0) {
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

/**
 * 
 * @returns Military Hour in the format of HH00 (i.e. 1800)
 */
function getCurHour() {
    return new Date().getHours() * 100;
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


// *TODO*: Add nutrition information
/**
 * Method of scraping data from website.
 * However, it also provides nutrition information - suitable for lazy loading
 * @param {*} data 
 * @param {*} itemNames 
 * @returns List of Food Products that has Name, StationId, and Short Description
 */
function getDetailedFoodProducts(data, itemNames) {
    let iterator = data.indexOf('"Product":');
    if (iterator === -1) {
        return null;
    }
    data = data.slice(iterator-1, data.length);
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
    const stationIdToName = new Map();
    const startOfStationMappingIndex = data.indexOf('"MenuStations":[{"StationId":', iterator);
    iterator = startOfStationMappingIndex;
    while (iterator < data.length) {
        const startOfStationIdIndex = data.indexOf('"StationId":', iterator) + 13;

        if (startOfStationIdIndex - 13 === -1) {
            break;
        }

        const endOfStationIdIndex = data.indexOf('"', startOfStationIdIndex);
        const stationId = data.slice(startOfStationIdIndex, endOfStationIdIndex);

        if (stationIdToName.has(stationId)) {
            data = data.slice(endOfStationIdIndex + 1);
            continue;
        }

        const startOfStationNameIndex = data.indexOf('"Name":', endOfStationIdIndex) + 8;
        const endOfStationNameIndex = data.indexOf('"', startOfStationNameIndex);
        const stationName = removeSpecialChar(data.slice(startOfStationNameIndex, endOfStationNameIndex));

        stationIdToName.set(stationId, stationName);

        // Skip to last stationId Index if valid
        const lastStationIdIndex = data.lastIndexOf(`{"StationId":"${stationId}"}`, endOfStationNameIndex) + 13;
        if (lastStationIdIndex - endOfStationIdIndex > 500 || lastStationIdIndex === -1) {  // Arbitrary number that signifies how far the last stationId can be
            iterator = endOfStationNameIndex + 1;
            continue;
        }

        iterator = lastStationIdIndex;
    }


    return [foodProducts, stationIdToName];
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
function bulkProcessFoodProducts(foodProducts, existingFoodProductsMapping, curDate, timeFrame, stationMapping) {
    const bulkOperations = [];
    for (const products of foodProducts) {
        const { stationId, marketingName, shortDescription } = products;

        if (!(stationId in stationMapping)) {
            console.log(`${stationId} is unknown`);
            continue;
        }

        const existingProduct = existingFoodProductsMapping.get(`${marketingName}-${stationMapping[stationId]}`)

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

function compareFunctionRuntimes(function1, args1, function2, args2, iterations=1) {
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        function1(...args1);
    }
    let end = performance.now();
    const function1Time = (end - start) / iterations;

    start = performance.now();
    for (let j = 0; j < iterations; j++) {
        function2(...args2);
    }
    end = performance.now();
    const function2Time = (end - start) / iterations;

    console.log(`Average time for function1: ${function1Time.toFixed(4)} ms`);
    console.log(`Average time for function2: ${function2Time.toFixed(4)} ms`);
}

async function getActualOrTestData(testMode=false) {
    if (testMode) {
        return fs.readFileSync("temp.txt", { encoding: 'utf-8'});
    } else {
        const res = await axios.get('https://virginia.campusdish.com/LocationsAndMenus/ObservatoryHillDiningRoom');
        return res.data;
    }
}

async function getData() {
    const res = await getActualOrTestData(true);
    const curDate = getCurDateAsString().trim();
    const timeFrame = getOhillTimeFrame(new Date().getDay(), getCurHour());
    const itemNames = new Set();
    const existingFoodProductsMapping = new Map();

    const foodProducts = getDetailedFoodProducts(res, itemNames);

    const existingFoodProducts = await ohillSchema.find({
        "item.timeFrame": timeFrame,
        "stationName": {
            $in: Object.values(ohillStations),
        },
    });

    for (const product of existingFoodProducts) {
        existingFoodProductsMapping.set(
            `${product.item.itemName}-${product.stationName}`,
            product,
        );
    }

    bulkOperations = bulkProcessFoodProducts(foodProducts, existingFoodProductsMapping, curDate, timeFrame, ohillStations);

    if (bulkOperations.length > 0) {
        try {
            ohillSchema.bulkWrite(bulkOperations);
        } catch (error) {
            console.error("Bulk write failed:", error)
        }
    }
}

module.exports = router;