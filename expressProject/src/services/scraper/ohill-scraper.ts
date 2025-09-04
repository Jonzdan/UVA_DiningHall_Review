import type { OhillTimeFrame } from 'src/models';
import { DiningHallDataParser } from './base-scraper';
import type { Axios } from 'axios';
import { OhillModel } from 'src/models';
import { getCurHour } from './util';
import type { StationFoodItemOutputs } from '@shared/api/food';

export class OhillDataParser {
    private readonly parser: DiningHallDataParser;

    constructor(axios: Axios, model: typeof OhillModel, url: string) {
        this.parser = new DiningHallDataParser(axios, model, url, this.getDiningHallTimeFrame(
            new Date().getDay(),
            getCurHour()
        ));
    }

    async getData(): Promise<StationFoodItemOutputs | undefined> {
        return await this.parser.getData();
    }

    public getDiningHallTimeFrame(date: number, time: number): OhillTimeFrame {
        if (date === 0 || date === 6) {
            if (time >= 800 && time < 1415) {
                return 'Brunch (8am-2:15pm)';
            }
            if (time < 800 || time >= 2000) {
                return 'Unavailable'; 
            }
        }
        if (time >= 700 && time < 1100) {
            return 'Breakfast (7am-11am)';
        } else if (time >= 1100 && time < 1415) {
            return 'Lunch (11am-2:15pm)';
        } else if (time >= 1415 && time < 1700) {
            return 'Afternoon Snack (2:15pm-5pm)';
        } else if (time >= 1700 && time < 2000) {
            return 'Dinner (5pm-8pm)';
        } else {
            return 'Unavailable';
        }
    }
}
