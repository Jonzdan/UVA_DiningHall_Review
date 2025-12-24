import type { DiningHallSchemaType } from "src/models/dininghall.js";
import { type AddItemReviewParams, type FindItemsParams } from "./interface.js";
import { DiningHallModel } from "src/models/dininghall.js";
import type { ReviewSchemaType } from "src/models/index.js";
import type { HydratedDocument } from "mongoose";

export async function updateItem(
    {
        hallId,
        activeDate,
        timeframe,
        stationItem: {
            stationName,
            item: {
                name,
                reviewOptions: {
                    stars,
                    review
                }
            }
        }
    }: AddItemReviewParams
): Promise<DiningHallSchemaType[] | null> {
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
    )
}

export async function findItems(
    {
        hallId,
        activeDate,
        timeframe,
        stationName
    }: FindItemsParams
): Promise<HydratedDocument<DiningHallSchemaType>[] | null> {
    return await DiningHallModel
        .find(
            {
                hallId,
                ...(
                    stationName && {
                        stationName
                    }
                ),
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
        )
        .sort({
            "item.itemReview.itemReviewCount": -1,
        });
}
