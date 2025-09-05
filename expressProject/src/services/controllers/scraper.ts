import {
    type DiningHalls,
    DiningHallsEnum,
    NewcombModel,
    OhillModel,
    type ReviewSchemaType,
    RunkModel,
    type SchemaTypes,
    type TimeFrameTypes,
} from "../../models/index.js";
import type { HydratedDocument, Model } from "mongoose";
import {
    MAX_REVIEWS,
    type StationFoodItemInput,
    type StationFoodItemOutput,
    type StationFoodItemOutputs,
} from "hoorank-shared";
import { getCurDateAsString } from "../scraper/index.js";

async function baseUpdateFoodSettings<T extends SchemaTypes>(
    model: Model<T>,
    foodItem: StationFoodItemInput,
    timeframe: TimeFrameTypes,
): Promise<HydratedDocument<T>[] | null> {
    const {
        item: { name, reviewOptions },
        stationName,
    } = foodItem;
    return await model.findOneAndUpdate(
        {
            stationName: stationName,
            activeDate: getCurDateAsString(),
            "item.timeFrame": {
                $in: [timeframe],
            },
            "item.itemName": name,
        },
        {
            $push: {
                "item.itemReview": {
                    stars: reviewOptions.stars,
                    ...(reviewOptions.review && {
                        review: reviewOptions.review,
                    }),
                } satisfies ReviewSchemaType,
            },
        },
        {
            returnOriginal: false,
            sanitizeFilter: true,
        },
    );
}

async function baseFindCurrentFoodData<T extends SchemaTypes>(
    model: Model<T>,
    curDate: string,
    timeFrame: TimeFrameTypes,
): Promise<HydratedDocument<T>[]> {
    return await model
        .find(
            {
                activeDate: {
                    $in: [curDate],
                },
                "item.timeFrame": timeFrame,
            },
            {
                _id: 0,
                activeDate: 0,
            },
            {
                sanitizeFilter: true,
                sanitizeProjection: true,
            },
        )
        .sort({
            "item.itemReview.itemReviewCount": -1,
        });
}

export async function updateFoodSettings(
    diningHall: DiningHalls,
    foodItem: StationFoodItemInput,
    timeFrame: TimeFrameTypes,
): Promise<void> {
    switch (diningHall) {
        case DiningHallsEnum.Runk:
            await baseUpdateFoodSettings(RunkModel, foodItem, timeFrame);
            break;
        case DiningHallsEnum.Newcomb:
            await baseUpdateFoodSettings(NewcombModel, foodItem, timeFrame);
            break;
        case DiningHallsEnum.Ohill:
            await baseUpdateFoodSettings(OhillModel, foodItem, timeFrame);
            break;
    }
}

export async function findCurrentFoodData(
    diningHall: DiningHalls,
    timeFrame: TimeFrameTypes,
): Promise<StationFoodItemOutputs | null> {
    let data: HydratedDocument<SchemaTypes>[] | undefined;
    switch (diningHall) {
        case DiningHallsEnum.Runk:
            data = await baseFindCurrentFoodData(
                RunkModel,
                getCurDateAsString(),
                timeFrame,
            );
            break;
        case DiningHallsEnum.Newcomb:
            data = await baseFindCurrentFoodData(
                NewcombModel,
                getCurDateAsString(),
                timeFrame,
            );
            break;
        case DiningHallsEnum.Ohill:
            data = await baseFindCurrentFoodData(
                OhillModel,
                getCurDateAsString(),
                timeFrame,
            );
            break;
    }

    if (!data.length) {
        return null;
    }

    return transformMongoDataToApi(data);
}

export function transformMongoDataToApi<T extends SchemaTypes>(
    data: HydratedDocument<T>[],
): StationFoodItemOutputs {
    return data.map((value: T) => {
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
