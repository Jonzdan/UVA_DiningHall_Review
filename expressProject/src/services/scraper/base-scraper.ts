import { Axios } from 'axios';
import type { SchemaTypes, TimeFrameTypes } from 'src/models';
import { readFileSync } from 'fs';
import { Document, Model, Types, type Condition } from 'mongoose';
import type { AnyBulkWriteOperation } from 'mongodb';
import type { FoodProducts } from './util';
import { DiningHallDataParserError, getCurDateAsString, removeSpecialChar } from './util';
import type { StationFoodItemOutputs } from "@shared/api/food"

export class DiningHallDataParser {
    private readonly axios: Axios;
    private readonly url: string;
    private readonly model: Model<SchemaTypes>;
    private readonly timeframe: Partial<TimeFrameTypes>;
    private readonly STATION_ID_IDENTIFIER = '"StationId":';
    private readonly STATION_NAME_IDENTIFIER = '"Name":';


    constructor(axios: Axios, model: Model<SchemaTypes>, url: string, timeframe: TimeFrameTypes) {
        this.axios = axios;
        this.url = url;
        this.model = model;
        this.timeframe = timeframe;
    }

    private async getActualOrTestData(testMode = false): Promise<string> {
        if (testMode) {
            return readFileSync("temp.txt", { encoding: 'utf-8'});
        } else {
            const res: { status: number, statusText: string, data: string } = await this.axios.get(this.url);
            if (res.status >= 400) {
                throw new DiningHallDataParserError(res.statusText);
            }
            return res.data;
        }
    }

    private mapStationIdToFoodSchema(foodProducts: FoodProducts[], stationIdsToNameMap: Map<string, string>): StationFoodItemOutputs {
        return foodProducts.map((value: FoodProducts) => {
            const { stationId, ...product} = value;
            return {
                stationName: stationIdsToNameMap.get(stationId)!,
                item: {
                    name: product.marketingName,
                    description: product.shortDescription
                }
            };
        });
    }
    
    public async getData(testMode = false): Promise<StationFoodItemOutputs | undefined> {
        const existingFoodProductsMapping = new Map();
        const [foodProducts, stationIdsToNameMap] = this.getStationsDetails(
            await this.getActualOrTestData(testMode)
        );
    
        const existingFoodProducts = await this.model.find({
            item: {
                timeFrame: this.timeframe
            },
            stationName: {
                $in: Object.values(stationIdsToNameMap),
            },
        });
    
        for (const product of existingFoodProducts) {
            existingFoodProductsMapping.set(
                `${product.item?.itemName}-${product.stationName}`,
                product,
            );
        }
    
        const bulkOperations = this.bulkProcessFoodProducts(foodProducts, existingFoodProductsMapping, getCurDateAsString(), this.timeframe, stationIdsToNameMap);

        if (bulkOperations.length > 0) {
            try {
                const result = await this.model.bulkWrite(bulkOperations);
                if (!result.isOk()) {
                    throw new Error();
                }
                return this.mapStationIdToFoodSchema(foodProducts, stationIdsToNameMap);
            } catch (error) {
                console.error(error);
                throw new DiningHallDataParserError("Bulk write failed");
            }
        }

        return undefined;
    }

    private getStationsDetails(data: string, itemNames = new Set<string>()): [FoodProducts[], Map<string, string>] {
        const detailedFoodProducts = this.getDetailedFoodProducts(data, itemNames);
        if (!detailedFoodProducts) {
            throw new DiningHallDataParserError("Failed to retrieve Station Details");
        }
        const [foodProducts, iterator] = detailedFoodProducts;
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
    private getDetailedFoodProducts(data: string, itemNames: Set<string>): [FoodProducts[], number] | null {
        const shopLocation = data.indexOf('"StationId":');
        if (shopLocation === -1) {
            return null;
        }
        data = data.slice(shopLocation-1, data.length);
        const foodProducts: FoodProducts[] = [];
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
        return [foodProducts, iterator];
    }

    /**
     * Parses static HTML data from UVA Dine websites, returns a mapping of Station Id : Station Name. 
     * @param {*} data
     * @param {*} iterator Optional parameter
     * @returns Map
     */
    private getStationIdToNameMap(data: string, iterator = 0): Map<string, string> {
        const stationIdToName = new Map<string, string>();
        const startOfStationMappingIndex = data.indexOf('"MenuStations":[{"StationId":', iterator);

        if (startOfStationMappingIndex === -1) {
            return stationIdToName;
        }

        iterator = startOfStationMappingIndex;
        while (iterator < data.length) {
            const startOfStationIdIndex = data.indexOf(this.STATION_ID_IDENTIFIER, iterator);

            if (startOfStationIdIndex === -1) {
                break;
            }

            const startOfStationId = startOfStationIdIndex + this.STATION_ID_IDENTIFIER.length;
            const endOfStationId = data.indexOf('"', startOfStationId);
            const stationId = data.slice(startOfStationId , endOfStationId);

            if (stationIdToName.has(stationId)) {
                iterator = startOfStationId + 1; 
                continue;
            }

            const startOfStationNameIndex = data.indexOf(this.STATION_NAME_IDENTIFIER, startOfStationId);

            if (startOfStationNameIndex === -1) {
                break;
            }

            const startOfStationName = startOfStationNameIndex + this.STATION_NAME_IDENTIFIER.length;
            const endOfStationName = data.indexOf('"', startOfStationName);
            const stationName = removeSpecialChar(data.slice(startOfStationName, endOfStationName));

            stationIdToName.set(stationId, stationName);
            iterator = endOfStationName + 1;
        }
        return stationIdToName;
    }

    /**
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
    private bulkProcessFoodProducts(
        foodProducts: FoodProducts[],
        existingFoodProductsMapping: Map<string, Document<Condition<Types.ObjectId | undefined>, object, SchemaTypes>>,
        curDate: string,
        timeFrame: Partial<TimeFrameTypes>,
        stationMapping: Map<string, string>
    ): AnyBulkWriteOperation<SchemaTypes>[] {
        const bulkOperations: AnyBulkWriteOperation<SchemaTypes>[] = []
        for (const products of foodProducts) {
            const { stationId, marketingName, shortDescription } = products;

            const stationName = stationMapping.get(stationId);
            if (!stationName) {
                console.error(`${stationId} is unknown`, stationMapping);
                continue;
            }

            const existingProduct = existingFoodProductsMapping.get(
                `${marketingName}-${stationName}`
            );

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
                if (timeFrame !== 'Unavailable') {
                    bulkOperations.push({
                        insertOne: {
                            document: {
                                stationName,
                                item: {
                                    itemName:  marketingName,
                                    itemDesc:  shortDescription,
                                    timeFrame: timeFrame,
                                },
                                activeDate: [curDate]
                            } as SchemaTypes,
                        },
                    });
                }
            }
        }
        return bulkOperations;
    }
}
