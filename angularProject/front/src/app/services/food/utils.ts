import type { DiningHalls, FoodItemOutput } from "hoorank-shared";
import type { Station } from "./types";

export function initDiningHallStation(type: DiningHalls): Station {
    return {
        diningHall: type,
        stationNames: new Set<string>(),
        isLoaded: false,
        shopItems: new Map<string, FoodItemOutput[]>()
    };
}
