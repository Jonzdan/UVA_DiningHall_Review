import type { HydratedDocument, Model } from "mongoose";
import { DiningHallsEnum, NewcombModel, OhillModel, RunkModel, type DiningHalls, type SchemaTypes, type TimeFrameTypes } from "src/models";
import { getCurDateAsString } from "../scraper";
import type { StationFoodItemOutput, StationFoodItemOutputs, StationFoodItemInput } from "@shared/api";
import { type ReviewSchemaType } from 'src/models';

async function baseUpdateFoodSettings<T extends Model<SchemaTypes>>(model: T, foodItem: StationFoodItemInput, timeframe: TimeFrameTypes): Promise<HydratedDocument<SchemaTypes>[] | null> {
    const { item: { name, reviewOptions }, stationName } = foodItem; 
    return await model.findOneAndUpdate(
        {
            stationName: stationName,
            activeDate:  getCurDateAsString(),
            "item.timeFrame": {
                $in: [timeframe]
            },
            "item.itemName": name,
        },
        {
            $push: {
                "item.itemReview": {
                    stars: reviewOptions!.star,
                    ...(reviewOptions?.review && { review: reviewOptions.review })
                } satisfies ReviewSchemaType
            }
        },
        {
            returnOriginal: false,
        }
    );
}

async function baseFindCurrentFoodData<T extends Model<SchemaTypes>>(model: T, curDate: string, timeFrame: TimeFrameTypes): Promise<HydratedDocument<SchemaTypes>[]> {
    return await model.find(
        {
            activeDate: {
                $in : [curDate],
            },
            'item.timeFrame': timeFrame,
        },
        {
            _id:                           0,
            activeDate:                    0,
        }
    ).sort({
        "item.itemReview.starsLength": -1,
    });
}

export async function updateFoodSettings(diningHall: DiningHalls, foodItem: StationFoodItemInput, timeFrame: TimeFrameTypes): Promise<void> {
    switch (diningHall) {
        case DiningHallsEnum.Runk:
            await baseUpdateFoodSettings<typeof RunkModel>(RunkModel, foodItem, timeFrame);
            break;
        case DiningHallsEnum.Newcomb:
            await baseUpdateFoodSettings<typeof NewcombModel>(NewcombModel, foodItem, timeFrame);
            break;
        case DiningHallsEnum.Ohill:
            await baseUpdateFoodSettings<typeof OhillModel>(OhillModel, foodItem, timeFrame);
            break;
    }
}

export async function findCurrentFoodData(diningHall: DiningHalls, timeFrame: TimeFrameTypes): Promise<StationFoodItemOutputs | null> {
    let data: HydratedDocument<SchemaTypes>[] | undefined;
    switch (diningHall) {
        case DiningHallsEnum.Runk:
            data = await baseFindCurrentFoodData<typeof RunkModel>(RunkModel, getCurDateAsString(), timeFrame);
            break;
        case DiningHallsEnum.Newcomb:
            data = await baseFindCurrentFoodData<typeof NewcombModel>(NewcombModel, getCurDateAsString(), timeFrame);
            break;
        case DiningHallsEnum.Ohill:
            data = await baseFindCurrentFoodData<typeof OhillModel>(OhillModel, getCurDateAsString(), timeFrame);
            break;
    }

    if (!data?.length) {
        return null;
    }

    return transformMongoDataToApi(data);
}

export function transformMongoDataToApi<T extends SchemaTypes>(data: HydratedDocument<T>[]): StationFoodItemOutputs {
    return data.map((value: T) => {
        const { item, stationName } = value;
        return {
            stationName,
            item: {
                name: item!.itemName,
                description: item!.itemDesc,
                reviewOptions: item?.itemReview
                    ? {
                        starRating: item.itemReview.reduce((prev, cur) => prev + cur.stars, 0) / item.itemReview.length,
                        details: item.itemReview
                    }
                    : undefined
            }
        } as StationFoodItemOutput
    });
}