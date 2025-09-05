import { type DiningHallTime, getCurHour } from "./util.js";
import { RunkModel, type RunkTimeFrame } from "../../models/index.js";
import type { Axios } from "axios";
import { DiningHallDataParser } from "./base-scraper.js";
import type { StationFoodItemOutputs } from "hoorank-shared";

export class RunkDataParser implements DiningHallTime {
    private readonly parser: DiningHallDataParser;

    constructor(axios: Axios, model: typeof RunkModel, url: string) {
        this.parser = new DiningHallDataParser(axios, model, url);
    }

    async getData(): Promise<StationFoodItemOutputs | undefined> {
        return await this.parser.getData(
            this.getDiningHallTimeFrame(new Date().getDay(), getCurHour()),
        );
    }

    getDiningHallTimeFrame(date: number, time: number): RunkTimeFrame {
        if (date == 0 || date == 6) {
            if (time >= 1000 && date < 1600) {
                return "Brunch";
            }

            if (time >= 1600 && time < 2000) {
                return "Dinner";
            }
        }

        if (time >= 700 && time < 1100) {
            return "Breakfast";
        }

        if (time >= 1100 && time < 1600) {
            return "Lunch";
        }

        if (time >= 1600 && time < 2000) {
            return "Dinner";
        }

        if (time >= 2000 && time < 2300) {
            return "Late Night";
        }

        return "Unavailable";
    }
}
