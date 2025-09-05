import {
    type AnyBulkWriteOperation,
    type Condition,
    Document,
    Model,
    Types,
} from "mongoose";
import {
    DiningHallDataParserError,
    getCurDateAsString,
    removeSpecialChar,
} from "./util.js";
import type { SchemaTypes, TimeFrameTypes } from "../../models/index.js";
import { Axios } from "axios";
import ExpressMongoSanitize from "express-mongo-sanitize";
import type { FoodProducts } from "./util.js";
import type { StationFoodItemOutputs } from "hoorank-shared";
import { readFileSync } from "fs";
import { sanitizeInput } from "../validation/index.js";

//TODO: Scraping past current timeframe shows next timeframe
export class DiningHallDataParser {
    private readonly axios: Axios;
    private readonly url: string;
    private readonly model: Model<SchemaTypes>;
    private readonly STATION_ID_IDENTIFIER = '"StationId":';
    private readonly STATION_NAME_IDENTIFIER = '"Name":';
    private readonly STATION_PRODUCT_IDENTIFIER = '"Product":';
    private readonly STATION_MARKETNAME_IDENTIFER = '"MarketingName":';
    private readonly STATION_DESC_IDENTIFIER = '"ShortDescription":';

    constructor(axios: Axios, model: Model<SchemaTypes>, url: string) {
        this.axios = axios;
        this.url = url;
        this.model = model;
    }

    private async getActualOrTestData(testMode = false): Promise<string> {
        if (testMode) {
            return readFileSync("temp.txt", { encoding: "utf-8" });
        } else {
            const res: { status: number; statusText: string; data: string } =
                await this.axios.get(this.url);
            if (res.status >= 400) {
                throw new DiningHallDataParserError(res.statusText);
            }
            return res.data;
        }
    }

    private mapStationIdToFoodSchema(
        foodProducts: FoodProducts[],
        stationIdsToNameMap: Map<string, string>,
    ): StationFoodItemOutputs {
        return foodProducts.map((value: FoodProducts) => {
            const { stationId, ...product } = value;
            return {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                stationName: stationIdsToNameMap.get(stationId)!,
                item: {
                    name: product.marketingName,
                    description: product.shortDescription,
                },
            };
        });
    }

    public async getData(
        timeframe: TimeFrameTypes,
        testMode = false,
    ): Promise<StationFoodItemOutputs | undefined> {
        const existingFoodProductsMapping = new Map<
            string,
            Document<Condition<Types.ObjectId | undefined>, object, SchemaTypes>
        >();
        const [foodProducts, stationIdsToNameMap] = this.getStationsDetails(
            await this.getActualOrTestData(testMode),
        );

        const existingFoodProducts = await this.model.find({
            item: {
                timeFrame: sanitizeInput(timeframe),
            },
            stationName: {
                $in: sanitizeInput(Object.values(stationIdsToNameMap)),
            },
        });

        for (const product of existingFoodProducts) {
            existingFoodProductsMapping.set(
                `${product.item.itemName}-${product.stationName}`,
                product,
            );
        }

        const bulkOperations = this.bulkProcessFoodProducts(
            foodProducts,
            existingFoodProductsMapping,
            getCurDateAsString(),
            timeframe,
            stationIdsToNameMap,
        );

        if (bulkOperations.length > 0) {
            try {
                const result = await this.model.bulkWrite(bulkOperations, {});
                if (!result.isOk()) {
                    throw new Error();
                }
                return this.mapStationIdToFoodSchema(
                    foodProducts,
                    stationIdsToNameMap,
                );
            } catch (error) {
                console.error(error);
                throw new DiningHallDataParserError("Bulk write failed");
            }
        }
        return this.mapStationIdToFoodSchema(foodProducts, stationIdsToNameMap);
        return undefined;
    }

    private getStringSlice(
        data: string,
        identifier: string,
        iterator = 0,
        startIndexOffset = 1,
        endIndexOffset = 1,
        terminationChar = '"',
    ) {
        const identifierIndex = data.indexOf(identifier, iterator);

        if (identifierIndex === -1) {
            return null;
        }

        const startIndex =
            identifierIndex + identifier.length + startIndexOffset;
        const endIndex = data.indexOf(
            terminationChar,
            startIndex + endIndexOffset,
        );
        return {
            result: data.slice(startIndex, endIndex),
            iterator: endIndex,
        };
    }

    private getStationsDetails(
        data: string,
        itemNames = new Set<string>(),
    ): [FoodProducts[], Map<string, string>] {
        const detailedFoodProducts = this.getDetailedFoodProducts(
            data,
            itemNames,
        );
        if (!detailedFoodProducts) {
            throw new DiningHallDataParserError(
                "Failed to retrieve Station Details",
            );
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
    private getDetailedFoodProducts(
        data: string,
        itemNames: Set<string>,
    ): [FoodProducts[], number] | null {
        const shopLocation = data.indexOf('"MenuProducts":[');
        if (shopLocation === -1) {
            return null;
        }
        data = data.slice(shopLocation - 1);
        const foodProducts: FoodProducts[] = [];
        let iterator = 0;
        while (iterator < data.length) {
            const newProductIndex = data.indexOf(
                this.STATION_PRODUCT_IDENTIFIER,
                iterator,
            );

            if (newProductIndex === -1) {
                /**
                 * Product denotes item exists. Below code is assumes properties are part of Product object
                 * Therefore, throw an error if those properties are missing
                 */
                break;
            }

            const stationIdRes = this.getStringSlice(
                data,
                this.STATION_ID_IDENTIFIER,
                iterator,
            );

            if (!stationIdRes) {
                throw new DiningHallDataParserError();
            }

            const { result: newStationId, iterator: endOfNewStationIdIndex } =
                stationIdRes;

            const stationNameRes = this.getStringSlice(
                data,
                this.STATION_MARKETNAME_IDENTIFER,
                endOfNewStationIdIndex + 1,
            );

            if (!stationNameRes) {
                throw new DiningHallDataParserError();
            }

            const { result: marketingName, iterator: endOfMarketingNameIndex } =
                stationNameRes;
            const newMarketingName = removeSpecialChar(marketingName);

            const stationDescRes = this.getStringSlice(
                data,
                this.STATION_DESC_IDENTIFIER,
                endOfMarketingNameIndex + 1,
            );

            if (!stationDescRes) {
                throw new DiningHallDataParserError();
            }

            const {
                result: shortDescription,
                iterator: endOfShortDescriptionIndex,
            } = stationDescRes;
            const newShortDescription = removeSpecialChar(shortDescription);

            foodProducts.push({
                stationId: newStationId,
                marketingName: newMarketingName,
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
    private getStationIdToNameMap(
        data: string,
        iterator = 0,
    ): Map<string, string> {
        const stationIdToName = new Map<string, string>();
        const startOfStationMappingIndex = data.indexOf(
            '"MenuStations":[{"StationId":',
            iterator,
        );

        if (startOfStationMappingIndex === -1) {
            return stationIdToName;
        }

        iterator = startOfStationMappingIndex;
        while (iterator < data.length) {
            const stationIdRes = this.getStringSlice(
                data,
                this.STATION_ID_IDENTIFIER,
                iterator,
            );

            if (!stationIdRes) {
                /**
                 * Property denotes item exists. Below code is assumes other properties are part of bigger object
                 * Therefore, throw an error if those properties are missing
                 */
                break;
            }

            const { result: newStationId, iterator: endOfNewStationIdIndex } =
                stationIdRes;

            if (stationIdToName.has(newStationId)) {
                iterator = endOfNewStationIdIndex + 1;
                continue;
            }

            const stationNameRes = this.getStringSlice(
                data,
                this.STATION_NAME_IDENTIFIER,
                endOfNewStationIdIndex + 1,
            );

            if (!stationNameRes) {
                throw new DiningHallDataParserError();
            }

            const { result: stationName, iterator: endOfStationName } =
                stationNameRes;

            const newStationName = removeSpecialChar(stationName);

            stationIdToName.set(newStationId, newStationName);
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
        existingFoodProductsMapping: Map<
            string,
            Document<Condition<Types.ObjectId | undefined>, object, SchemaTypes>
        >,
        curDate: string,
        timeFrame: Partial<TimeFrameTypes>,
        stationMapping: Map<string, string>,
    ): AnyBulkWriteOperation<SchemaTypes>[] {
        const bulkOperations: AnyBulkWriteOperation<SchemaTypes>[] = [];
        for (const products of foodProducts) {
            const sanitizedProducts = ExpressMongoSanitize.sanitize(products);
            const { stationId, marketingName, shortDescription } =
                sanitizedProducts;

            const stationName = sanitizeInput(stationMapping.get(stationId));
            if (!stationName) {
                console.error(`${stationId} is unknown`, stationMapping);
                continue;
            }

            const existingProduct = existingFoodProductsMapping.get(
                `${marketingName}-${stationName}`,
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
                            },
                        },
                    },
                });
            } else {
                if (timeFrame !== "Unavailable") {
                    bulkOperations.push({
                        insertOne: {
                            document: {
                                stationName,
                                item: {
                                    itemName: sanitizeInput(marketingName),
                                    itemDesc: sanitizeInput(shortDescription),
                                    timeFrame: timeFrame,
                                },
                                activeDate: [curDate],
                            } as SchemaTypes,
                        },
                    });
                }
            }
        }
        return bulkOperations;
    }
}
