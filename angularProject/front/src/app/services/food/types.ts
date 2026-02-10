import type { DiningHalls, FoodItemOutput } from "hoorank-shared";

export interface Station {
    readonly diningHall: DiningHalls; 
    stationNames: StationNames;
    isLoaded: boolean;
    shopItems: ShopItems;
}

export interface DiningHallStations {
    readonly runk: Station;
    readonly newcomb: Station;
    readonly ohill: Station
}

export type HttpMethod = 'GET' | 'POST' | 'PUT';
export type ShopItems = Map<string, FoodItemOutput[]>
export type StationNames = Set<string>;
