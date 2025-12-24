import type { StationFoodItemInput } from "hoorank-shared";
import type { Types } from "mongoose";
import type { TimeFrameTypes } from "src/models/index.js";

export interface AddItemReviewParams {
    readonly hallId: string;
    readonly activeDate: string;
    readonly timeframe: TimeFrameTypes;
    readonly stationItem: StationFoodItemInput;
}

export interface FindItemsParams {
    readonly hallId: string;
    readonly activeDate: string;
    readonly timeframe: TimeFrameTypes;
    readonly stationName?: string;
}

export interface UpdateTokenMetadata {
    upsert: boolean;
    expiresAt?: Date;
}

export interface UpdateTokensParams {
    readonly metadata: UpdateTokenMetadata;
    readonly userId?: Types.ObjectId | undefined;
    readonly oldCsrfToken?: string;
    readonly newCsrfToken?: string;
    readonly sessionId?: string;
}

export interface FindTokenParams {
    csrfToken?: string | undefined;
    sessionId?: string | undefined;
}
