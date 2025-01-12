const fs = require('fs');
const axios = require('axios');


// TODO: Scrape Time Data from Website as well
class DiningHallDataParser {
    constructor(url, diningHallSchema) {
        this.url = url;
        this.diningHallSchema = diningHallSchema;
    }

    async getActualOrTestData(testMode=false) {
        if (testMode) {
            return fs.readFileSync("temp.txt", { encoding: 'utf-8'});
        } else {
            const res = await axios.get(this.url);
            return res.data;
        }
    }
    
    async getData(diningHallSchema, testMode=false) {
        const res = await this.getActualOrTestData(testMode);
        const curDate = this.getCurDateAsString().trim();
        const timeFrame = this.getDiningHallTimeFrame(new Date().getDay(), this.getCurHour());
        const itemNames = new Set();
        const existingFoodProductsMapping = new Map();
    
        const [foodProducts, stationIdsToNameMap] = this.getStationsDetails(res, itemNames);
    
        const existingFoodProducts = await diningHallSchema.find({
            "item.timeFrame": timeFrame,
            "stationName": {
                $in: Object.values(stationIdsToNameMap),
            },
        });
    
        for (const product of existingFoodProducts) {
            existingFoodProductsMapping.set(
                `${product.item.itemName}-${product.stationName}`,
                product,
            );
        }
    
        const bulkOperations = this.bulkProcessFoodProducts(foodProducts, existingFoodProductsMapping, curDate, timeFrame, stationIdsToNameMap);

        if (bulkOperations.length > 0) {
            try {
                await diningHallSchema.bulkWrite(bulkOperations);
            } catch (error) {
                console.error("Bulk write failed:", error)
            }
        }
    }

    getStationsDetails(data, itemNames=new Set()) {
        let [foodProducts, iterator] = this.getDetailedFoodProducts(data, itemNames);
        const stationIdToNameMap = this.getStationIdToNameMap(data, iterator);
        return [foodProducts, stationIdToNameMap];
    }

    // *TODO*: Add nutrition information
    /**
     * Method of scraping data from website.
     * However, it also provides nutrition information
     * @param {*} data 
     * @param {*} itemNames 
     * @returns List of Food Products that has Name, StationId, and Short Description
     */
    getDetailedFoodProducts(data, itemNames) {
        const shopLocation = data.indexOf('"StationId":');
        if (shopLocation === -1) {
            return null;
        }
        data = data.slice(shopLocation-1, data.length);
        const foodProducts = [];
        let iterator = 0;
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
            const newMarketingName = this.removeSpecialChar(data.slice(startOfMarketingNameIndex, endOfMarketingNameIndex));

            const startOfShortDescriptionObjectIndex = data.indexOf("ShortDescription", endOfMarketingNameIndex + 1);
            const startOfShortDescriptionIndex = data.indexOf('"', startOfShortDescriptionObjectIndex + 18) + 1;
            const endOfShortDescriptionIndex = data.indexOf('"', startOfShortDescriptionIndex + 3);
            const newShortDescription = this.removeSpecialChar(data.slice(startOfShortDescriptionIndex, endOfShortDescriptionIndex));

            foodProducts.push({
                stationId:        newStationId,
                marketingName:    newMarketingName,
                shortDescription: newShortDescription,
            });

            itemNames.add(newMarketingName);

            iterator = endOfShortDescriptionIndex + 1;
        }
        return [foodProducts, iterator];
    }

    /**
     * Parses static HTML data from UVA Dine websites, returns a mapping of Station Id : Station Name. 
     * @param {*} data
     * @param {*} iterator Optional parameter
     * @returns Map
     */
    getStationIdToNameMap(data, iterator=0) {
        const stationIdToName = new Map();
        const startOfStationMappingIndex = data.indexOf('"MenuStations":[{"StationId":', iterator);
        if (startOfStationMappingIndex === -1) {
            return stationIdToName;
        }
        iterator = startOfStationMappingIndex;
        while (iterator < data.length) {
            const startOfStationIdIndex = data.indexOf('"StationId":', iterator) + 13;

            if (startOfStationIdIndex - 13 === -1) {
                break;
            }

            const endOfStationIdIndex = data.indexOf('"', startOfStationIdIndex);
            const stationId = data.slice(startOfStationIdIndex, endOfStationIdIndex);

            if (stationIdToName.has(stationId)) {
                iterator = endOfStationIdIndex + 1; 
                continue;
            }

            const startOfStationNameIndex = data.indexOf('"Name":', endOfStationIdIndex) + 8;

            if (startOfStationNameIndex - 8 === -1) {
                break;
            }

            const endOfStationNameIndex = data.indexOf('"', startOfStationNameIndex);
            const stationName = this.removeSpecialChar(data.slice(startOfStationNameIndex, endOfStationNameIndex));

            stationIdToName.set(stationId, stationName);

            iterator = endOfStationNameIndex + 1;
        }
        return stationIdToName;
    }

    /**
     * 
     * @param {*} foodProducts
     * Array of {
     *      stationId:        newStationId,
            marketingName:    newMarketingName,
            shortDescription: newShortDescription,
        }
    * @param {*} existingFoodProductsMapping
    * A Map Object of Key: `${item.itemName}-${stationName}`, Value: { MongoDB Document Item }
    * @param {*} curDate
    * A String of Format: YYYYMMDD
    * @param {*} timeFrame
    * A String representing Dining hall specific timeframe (i.e. 'Dinner(5pm-8pm)')
    * @param {*} stationMapping 
    * A Map Object of Station ID : Station Name
    * @returns An array of MongoDB write operations
    */
    bulkProcessFoodProducts(foodProducts, existingFoodProductsMapping, curDate, timeFrame, stationMapping) {
        const bulkOperations = [];
        for (const products of foodProducts) {
            const { stationId, marketingName, shortDescription } = products;

            if (!stationMapping.has(stationId)) {
                console.log(`${stationId} is unknown`, stationMapping);
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
                    stationName: stationMapping.get(stationId),
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

    getDiningHallTimeFrame(date, time) {
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

    /**
     * 
     * @returns Military Hour in the format of HH00 (i.e. 1800)
     */
    getCurHour() {
        return new Date().getHours() * 100;
    }

    removeSpecialChar(string) {
        if (!string) {
            return string;
        }
        return string.replace(/\\u0026/g, '&').replace(/\\u0027/g, "'");
    }
    
    getCurDateAsString() {
        return new Date().toISOString().slice(0, 10).replace(/-/g, '');
    }
}

module.exports = { DiningHallDataParser };