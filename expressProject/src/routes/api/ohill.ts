import { DiningHallsEnum, OhillModel } from "../../models/index.js";
import {
    OhillDataParser,
    axios,
    csrf,
    findCurrentFoodData,
    getCurHour,
    updateFoodSettings,
    validateBody,
} from "../../services/index.js";
import { HttpStatusCode } from "axios";
import { Router } from "express";
import { StationFoodItemSchemaInput } from "hoorank-shared";
import { mongoSanitizerMiddleware } from "../../utils.js";

const url =
    "https://virginia.campusdish.com/LocationsAndMenus/ObservatoryHillDiningRoom";
export const ohillRouter = Router();
const parser = new OhillDataParser(axios, OhillModel, url);

ohillRouter.get("/", async (_req, res): Promise<void> => {
    try {
        const timeFrame = parser.getDiningHallTimeFrame(
            new Date().getDay(),
            getCurHour(),
        );
        const initialData = await findCurrentFoodData(
            DiningHallsEnum.Ohill,
            timeFrame,
        );

        if (!initialData?.length) {
            const data = await parser.getData();

            if (!data) {
                res.status(HttpStatusCode.ServiceUnavailable).end();
                return;
            }

            res.status(HttpStatusCode.Ok).json(data).end();
        } else {
            res.status(HttpStatusCode.NotModified).json(initialData);
        }
    } catch (err) {
        console.error(err);
        res.status(HttpStatusCode.InternalServerError).json({
            msg: err instanceof Error ? err.message : "",
        });
    }
});

ohillRouter.post(
    "/",
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput),
    async (req, res) => {
        try {
            await updateFoodSettings(
                DiningHallsEnum.Ohill,
                req.body,
                parser.getDiningHallTimeFrame(
                    new Date().getDay(),
                    getCurHour(),
                ),
            );
            res.status(HttpStatusCode.NoContent).end();
        } catch (err) {
            console.error(err);
            res.status(HttpStatusCode.InternalServerError).json({
                msg: err instanceof Error ? err.message : "",
            });
        }
    },
);
