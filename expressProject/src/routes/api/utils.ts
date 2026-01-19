import type { Response } from "express";

import { HttpStatusCode } from "axios";
import {
    type DiningHalls,
    DiningHallsEnum,
    type StationFoodItemInput,
} from "hoorank-shared";

import {
    type DiningHallDataParserTime,
    findCurrentFoodData,
    getCurHour,
    updateFoodSettings,
} from "../../services/index.js";

export async function addFoodItem(
    parser: DiningHallDataParserTime,
    res: Response,
    item: StationFoodItemInput,
) {
    try {
        await updateFoodSettings(
            DiningHallsEnum.Ohill,
            item,
            parser.getDiningHallTimeFrame(new Date().getDay(), getCurHour()),
        );
        res.status(HttpStatusCode.NoContent).end();
    } catch (err) {
        console.error(err);
        res.status(HttpStatusCode.InternalServerError).json({
            msg: err instanceof Error ? err.message : "",
        });
    }
}

export async function getFoodData(
    parser: DiningHallDataParserTime,
    res: Response,
    hallId: DiningHalls,
) {
    try {
        const timeframe = parser.getDiningHallTimeFrame(
            new Date().getDay(),
            getCurHour(),
        );
        if (timeframe === "Unavailable") {
            res.status(HttpStatusCode.Ok).end();
            return;
        }

        const initialData = await findCurrentFoodData(hallId, timeframe);

        if (!initialData?.length) {
            const data = await parser.getData();

            if (!data) {
                res.status(HttpStatusCode.ServiceUnavailable).end();
                return;
            }

            res.status(HttpStatusCode.Ok).json(data);
        } else {
            res.status(HttpStatusCode.Ok).json(initialData);
        }
    } catch (err) {
        console.error(err);
        res.status(HttpStatusCode.InternalServerError).json({
            msg: err instanceof Error ? err.message : "",
        });
    }
}
