import {
    type AnyBulkWriteOperation,
    type HydratedDocument,
    type MongooseBulkWriteResult,
} from "mongoose";

import {
    DiningHallModel,
    type DiningHallSchemaType,
    type ReviewSchemaType,
} from "../models/index.js";
import {
    type AddBulkWriteInsertOneItemParams,
    type AddItemReviewParams,
    type BulkWriteItemParams,
    type FindItemsParams,
} from "./interface.js";

export function addBulkWriteInsertOneItem({
    curDate,
    hallId,
    marketingName,
    shortDescription,
    stationName,
    timeframe,
}: AddBulkWriteInsertOneItemParams): AnyBulkWriteOperation<DiningHallSchemaType> {
    return {
        insertOne: {
            document: {
                activeDate: curDate,
                hallId,
                item: {
                    itemDesc: shortDescription,
                    itemName: marketingName,
                    timeFrame: timeframe,
                },
                stationName,
            } as DiningHallSchemaType,
        },
    };
}

export async function bulkWriteItems({
    items,
}: BulkWriteItemParams): Promise<MongooseBulkWriteResult> {
    return await DiningHallModel.bulkWrite(items);
}

// TODO: bound results -- unlikely to contain more than 100 items for a day
export async function findItems({
    activeDate,
    hallId,
    station,
    timeframe,
}: FindItemsParams): Promise<HydratedDocument<DiningHallSchemaType>[]> {
    return await DiningHallModel.find(
        {
            hallId,
            ...(station?.stationName && {
                stationName: station.stationName,
            }),
            ...(station?.stationNames && {
                stationName: {
                    $in: station.stationNames,
                },
            }),
            activeDate: activeDate,
            "item.timeFrame": timeframe,
        },
        {
            _id: 0,
            activeDate: 0,
        },
        {
            sanitizeFilter: true,
            sanitizeProjection: true,
        },
    ).sort({
        "item.itemReviewCount": -1,
    });
}

export async function updateItem({
    activeDate,
    hallId,
    stationItem: {
        item: {
            name,
            reviewOptions: { review, stars },
        },
        stationName,
    },
    timeframe,
}: AddItemReviewParams): Promise<DiningHallSchemaType[] | null> {
    return await DiningHallModel.findOneAndUpdate(
        {
            activeDate,
            hallId,
            "item.itemName": name,
            "item.timeFrame": timeframe,
            stationName,
        },
        {
            $inc: {
                "item.itemReviewCount": 1,
                "item.itemTotalStars": stars,
            },
            $push: {
                "item.itemReview": {
                    stars: stars,
                    ...(review && { review }),
                    createdAt: new Date(),
                } satisfies ReviewSchemaType,
            },
        },
        {
            returnOriginal: false,
            sanitizeFilter: true,
        },
    );
}
