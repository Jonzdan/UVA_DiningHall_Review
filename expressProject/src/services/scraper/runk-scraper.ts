import { type DiningHallTime, getCurHour } from "./util.js";
import { DiningHallsEnum, type StationFoodItemOutputs } from "hoorank-shared";
import type { Axios } from "axios";
import { DiningHallDataParser } from "./base-scraper.js";
import { type RunkTimeFrame } from "../../models/index.js";

export class RunkDataParser implements DiningHallTime {
    private readonly parser: DiningHallDataParser;

    constructor(axios: Axios, url: string) {
        this.parser = new DiningHallDataParser(axios, url);
    }

    async getData(): Promise<StationFoodItemOutputs | undefined> {
        return await this.parser.getData(
            DiningHallsEnum.Runk,
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
