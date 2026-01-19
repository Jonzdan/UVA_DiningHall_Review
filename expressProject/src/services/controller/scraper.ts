import type { DiningHallSchemaType } from "src/models/index.js";

import {
    type DiningHalls,
    MAX_REVIEWS,
    type StationFoodItemInput,
    type StationFoodItemOutput,
    type StationFoodItemOutputs,
} from "hoorank-shared";

import { type TimeFrameTypes } from "../../models/index.js";
import { findItems, updateItem } from "../../repositories/index.js";
import { getCurDateAsString } from "../scraper/index.js";

export async function findCurrentFoodData(
    diningHall: DiningHalls,
    timeframe: TimeFrameTypes,
): Promise<null | StationFoodItemOutputs> {
    const data = await findItems({
        activeDate: getCurDateAsString(),
        hallId: diningHall,
        timeframe,
    });

    if (!data.length) {
        return null;
    }

    return transformMongoDataToApi(data);
}

export function transformMongoDataToApi(
    data: DiningHallSchemaType[],
): StationFoodItemOutputs {
    return data.map((value: DiningHallSchemaType) => {
        const {
            item: { itemDesc, itemName, itemReview },
            stationName,
        } = value;
        return {
            item: {
                description: itemDesc,
                name: itemName,
                reviewOptions: {
                    details: itemReview.slice(0, MAX_REVIEWS),
                    starRating:
                        itemReview
                            .map((review) => review.stars)
                            .reduce((prev, stars) => prev + stars, 0) /
                        itemReview.length,
                },
            },
            stationName,
        } as StationFoodItemOutput;
    });
}

export async function updateFoodSettings(
    diningHall: DiningHalls,
    foodItem: StationFoodItemInput,
    timeframe: TimeFrameTypes,
): Promise<void> {
    await updateItem({
        activeDate: getCurDateAsString(),
        hallId: diningHall,
        stationItem: foodItem,
        timeframe,
    });
}
