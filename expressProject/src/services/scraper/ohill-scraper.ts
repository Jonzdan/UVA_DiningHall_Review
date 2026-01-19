import { DiningHallsEnum, type StationFoodItemOutputs } from "hoorank-shared";

import { type OhillTimeFrame } from "../../models/index.js";
import { DiningHallDataParser } from "./base-scraper.js";
import { type DiningHallTime, getCurHour } from "./util.js";

export class OhillDataParser
    extends DiningHallDataParser
    implements DiningHallTime
{
    override async getData(): Promise<StationFoodItemOutputs | undefined> {
        return await super.getData(
            DiningHallsEnum.Ohill,
            this.getDiningHallTimeFrame(new Date().getDay(), getCurHour()),
        );
    }

    public getDiningHallTimeFrame(date: number, time: number): OhillTimeFrame {
        if (date === 0 || date === 6) {
            if (time >= 800 && time < 1415) {
                return "Brunch (8am-2:15pm)";
            }
            if (time < 800 || time >= 2000) {
                return "Unavailable";
            }
        }
        if (time >= 700 && time < 1100) {
            return "Breakfast (7am-11am)";
        } else if (time >= 1100 && time < 1415) {
            return "Lunch (11am-2:15pm)";
        } else if (time >= 1415 && time < 1700) {
            return "Afternoon Snack (2:15pm-5pm)";
        } else if (time >= 1700 && time < 2000) {
            return "Dinner (5pm-8pm)";
        } else {
            return "Unavailable";
        }
    }
}
