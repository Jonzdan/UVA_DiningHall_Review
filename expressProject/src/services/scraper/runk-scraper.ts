import { type DiningHallTime, getCurHour } from "./util.js";
import { DiningHallsEnum, type StationFoodItemOutputs } from "hoorank-shared";
import type { Axios } from "axios";
import { DiningHallDataParser } from "./base-scraper.js";
import { type RunkTimeFrame } from "../../models/index.js";

export class RunkDataParser extends DiningHallDataParser implements DiningHallTime {
    constructor(axios: Axios, url: string) {
        super(axios, url);
    }

    override async getData(): Promise<StationFoodItemOutputs | undefined> {
        return await super.getData(
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
