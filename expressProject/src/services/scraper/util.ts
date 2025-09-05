import { Axios } from "axios";
import type { TimeFrameTypes } from "src/models/types.js";

export interface FoodProducts extends Record<string, string> {
    stationId: string;
    marketingName: string;
    shortDescription: string;
}

export const axios: Axios = new Axios();

export class DiningHallDataParserError extends Error {}

export interface DiningHallTime {
    /**
     *
     * @param date 0-6, represents days of the week. 6 is Saturday
     * @param time HHMM
     * @returns timeframe
     */
    getDiningHallTimeFrame(date: number, time: number): TimeFrameTypes;
}

/**
 * @returns Military Hour in the format of HH00 (i.e. 1800)
 */
export function getCurHour(): number {
    return new Date().getHours() * 100;
}

export function removeSpecialChar(input: string): string {
    if (!input) {
        return input;
    }
    return input.replace(/\\u0026/g, "&").replace(/\\u0027/g, "'");
}

export function getCurDateAsString(): string {
    return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}
