import type { DiningHalls, StationFoodItemInput } from "hoorank-shared";
import type { AnyBulkWriteOperation, Types } from "mongoose";
import type { DiningHallSchemaType, TimeFrameTypes } from "src/models/index.js";

export interface AddBulkWriteInsertOneItemParams {
    readonly curDate: string;
    readonly hallId: DiningHalls;
    readonly marketingName: string;
    readonly shortDescription: string;
    readonly stationName: string;
    readonly timeframe: TimeFrameTypes;
}

export interface AddItemReviewParams {
    readonly activeDate: string;
    readonly hallId: string;
    readonly stationItem: StationFoodItemInput;
    readonly timeframe: TimeFrameTypes;
}

export interface BulkWriteItemParams {
    readonly items: AnyBulkWriteOperation<DiningHallSchemaType>[];
}

export type ExactlyOne<T, Keys extends keyof T = keyof T> = {
    [K in Keys]: Partial<Record<Exclude<Keys, K>, never>> &
        Required<Pick<T, K>>;
}[Keys];

export interface FindItemsParams {
    readonly activeDate: string;
    readonly hallId: DiningHalls;
    readonly station?: ExactlyOne<{
        readonly stationName: string;
        readonly stationNames: string[];
    }>;
    readonly timeframe: TimeFrameTypes;
}

export interface FindTokenParams {
    readonly csrfToken?: string | undefined;
    readonly sessionId?: string | undefined;
}

export interface UpdateTokenMetadata {
    readonly expiresAt?: Date;
    readonly upsert: boolean;
}

export interface UpdateTokensParams {
    readonly metadata: UpdateTokenMetadata;
    readonly newCsrfToken?: string;
    readonly oldCsrfToken?: string;
    readonly sessionId?: string;
    readonly userId?: Types.ObjectId | undefined;
}
