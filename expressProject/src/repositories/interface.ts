import type { AnyBulkWriteOperation, Types } from "mongoose";
import type { DiningHallSchemaType, TimeFrameTypes } from "src/models/index.js";
import type { DiningHalls, StationFoodItemInput } from "hoorank-shared";

export interface AddItemReviewParams {
    readonly hallId: string;
    readonly activeDate: string;
    readonly timeframe: TimeFrameTypes;
    readonly stationItem: StationFoodItemInput;
}

export type ExactlyOne<T, Keys extends keyof T = keyof T> = {
    [K in Keys]: Required<Pick<T, K>> &
        Partial<Record<Exclude<Keys, K>, never>>;
}[Keys];

export interface FindItemsParams {
    readonly hallId: DiningHalls;
    readonly activeDate: string;
    readonly timeframe: TimeFrameTypes;
    readonly station?: ExactlyOne<{
        readonly stationName: string;
        readonly stationNames: string[];
    }>;
}

export interface UpdateTokenMetadata {
    readonly upsert: boolean;
    readonly expiresAt?: Date;
}

export interface UpdateTokensParams {
    readonly metadata: UpdateTokenMetadata;
    readonly userId?: Types.ObjectId | undefined;
    readonly oldCsrfToken?: string;
    readonly newCsrfToken?: string;
    readonly sessionId?: string;
}

export interface FindTokenParams {
    readonly csrfToken?: string | undefined;
    readonly sessionId?: string | undefined;
}

export interface BulkWriteItemParams {
    readonly items: AnyBulkWriteOperation<DiningHallSchemaType>[];
}

export interface AddBulkWriteUpdateItemParams {
    readonly _id: Types.ObjectId | undefined;
    readonly curDate: string;
}

export interface AddBulkWriteInsertOneItemParams {
    readonly stationName: string;
    readonly marketingName: string;
    readonly shortDescription: string;
    readonly timeframe: TimeFrameTypes;
    readonly curDate: string;
}
