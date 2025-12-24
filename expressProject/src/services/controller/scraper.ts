import {
    type DiningHalls,
    MAX_REVIEWS,
    type StationFoodItemInput,
    type StationFoodItemOutput,
    type StationFoodItemOutputs,
} from "hoorank-shared";
import {
    type TimeFrameTypes,
} from "../../models/index.js";
import { getCurDateAsString } from "../scraper/index.js";
import { findItems, updateItem } from "../../repositories/index.js";
import type { DiningHallSchemaType } from "src/models/index.js";

export async function updateFoodSettings(
    diningHall: DiningHalls,
    foodItem: StationFoodItemInput,
    timeframe: TimeFrameTypes,
): Promise<void> {
    await updateItem({
        hallId: diningHall,
        activeDate: getCurDateAsString(),
        stationItem: foodItem,
        timeframe
    });
}

export async function findCurrentFoodData(
    diningHall: DiningHalls,
    timeframe: TimeFrameTypes,
): Promise<StationFoodItemOutputs | null> {
    const data = await findItems({
        hallId: diningHall,
        timeframe,
        activeDate: getCurDateAsString()
    });

    if (!data?.length) {
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
            stationName,
            item: {
                name: itemName,
                description: itemDesc,
                reviewOptions: {
                    starRating:
                        itemReview
                            .map((review) => review.stars)
                            .reduce((prev, stars) => prev + stars, 0) /
                        itemReview.length,
                    details: itemReview.slice(0, MAX_REVIEWS),
                },
            },
        } as StationFoodItemOutput;
    });
}
