import type { DiningHalls } from "hoorank-shared";

import type { TimeFrameTypes } from "../../models/index.js";
import type { FoodProducts } from "./util.js";

export interface BulkProcessFoodItemsParams {
    readonly curDate: string;
    readonly foodProducts: FoodProducts[];
    readonly hallId: DiningHalls;
    readonly stationMapping: Map<string, string>;
    readonly timeFrame: TimeFrameTypes;
}
