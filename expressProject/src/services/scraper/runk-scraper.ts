import type { RunkModel, RunkTimeFrame } from 'src/models';
import { DiningHallDataParser } from './base-scraper';
import type { Axios } from 'axios';
import { getCurHour } from './util';
import type { StationFoodItemOutputs } from '@shared/api/food';
export class RunkDataParser {
    private readonly parser: DiningHallDataParser;

    constructor(axios: Axios, model: typeof RunkModel, url: string) {
        this.parser = new DiningHallDataParser(axios, model, url, this.getDiningHallTimeFrame(
            new Date().getDay(),
            getCurHour()
        ));
    }

    async getData(): Promise<StationFoodItemOutputs | undefined> {
        return await this.parser.getData();
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

        return "Unavailable"
    }
} 
