import { type DiningHallTime, getCurHour } from "./util.js";
import {
    type NewcombDiningHallTimeFrame,
    NewcombModel,
} from "../../models/index.js";
import type { Axios } from "axios";
import { DiningHallDataParser } from "./base-scraper.js";
import type { StationFoodItemOutputs } from "hoorank-shared";

export class NewcombDataParser implements DiningHallTime {
    private readonly parser: DiningHallDataParser;

    constructor(axios: Axios, model: typeof NewcombModel, url: string) {
        this.parser = new DiningHallDataParser(axios, model, url);
    }

    async getData(): Promise<StationFoodItemOutputs | undefined> {
        return await this.parser.getData(
            this.getDiningHallTimeFrame(new Date().getDay(), getCurHour()),
        );
    }

    getDiningHallTimeFrame(
        date: number,
        time: number,
    ): NewcombDiningHallTimeFrame {
        if (date == 6) {
            return "Closed";
        }
        if (date == 5 && (time >= 1400 || time < 700)) {
            return "Unavailable";
        }
        if (date == 0 && time >= 1000 && time < 1400) {
            return "Brunch (10am-2pm)";
        }

        if (time >= 700 && time < 1030) {
            return "Breakfast (7am-10:30am)";
        } else if (time >= 1100 && time < 1400) {
            return "Lunch (11am-2pm)";
        } else if (time >= 1400 && time < 1700) {
            return "Afternoon Snack (2pm-5pm)";
        } else if (time >= 1700 && time < 2000) {
            return "Dinner (5pm-8pm)";
        } else {
            return "Unavailable";
        }
    }
}
