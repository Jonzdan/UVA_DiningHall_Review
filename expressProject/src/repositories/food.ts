import {
    type AddBulkWriteInsertOneItemParams,
    type AddBulkWriteUpdateItemParams,
    type AddItemReviewParams,
    type BulkWriteItemParams,
    type FindItemsParams,
} from "./interface.js";
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

export async function updateItem({
    hallId,
    activeDate,
    timeframe,
    stationItem: {
        stationName,
        item: {
            name,
            reviewOptions: { stars, review },
        },
    },
}: AddItemReviewParams): Promise<DiningHallSchemaType[] | null> {
    return await DiningHallModel.findOneAndUpdate(
        {
            hallId,
            stationName,
            activeDate,
            "item.timeFrame": {
                $in: [timeframe],
            },
            "item.itemName": name,
        },
        {
            $push: {
                "item.itemReview": {
                    stars: stars,
                    ...(review && {
                        review: review,
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

// TODO: bound results
export async function findItems({
    hallId,
    activeDate,
    timeframe,
    station,
}: FindItemsParams): Promise<HydratedDocument<DiningHallSchemaType>[]> {
    console.log({
        hallId,
        ...(station?.stationName && {
            stationName: station.stationName,
        }),
        ...(station?.stationName && {
            stationName: {
                $in: station.stationNames,
            },
        }),
        activeDate: {
            $in: [activeDate],
        },
        "item.timeFrame": timeframe,
    })
    return await DiningHallModel.find(
        {
            hallId,
            ...(station?.stationName && {
                stationName: station.stationName,
            }),
            ...(station?.stationName && {
                stationName: {
                    $in: station.stationNames,
                },
            }),
            activeDate: {
                $in: [activeDate],
            },
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

export async function bulkWriteItems({
    items,
}: BulkWriteItemParams): Promise<MongooseBulkWriteResult> {
    return await DiningHallModel.bulkWrite(items);
}

export function addBulkWriteUpdateItem({
    _id,
    curDate,
}: AddBulkWriteUpdateItemParams): AnyBulkWriteOperation<DiningHallSchemaType> {
    return {
        updateOne: {
            filter: {
                _id,
            },
            update: {
                $push: {
                    activeDate: curDate,
                },
            },
        },
    };
}

export function addBulkWriteInsertOneItem({
    curDate,
    marketingName,
    shortDescription,
    stationName,
    timeframe,
}: AddBulkWriteInsertOneItemParams): AnyBulkWriteOperation<DiningHallSchemaType> {
    return {
        insertOne: {
            document: {
                stationName,
                item: {
                    itemName: marketingName,
                    itemDesc: shortDescription,
                    timeFrame: timeframe,
                },
                activeDate: [curDate],
            } as DiningHallSchemaType,
        },
    };
}
