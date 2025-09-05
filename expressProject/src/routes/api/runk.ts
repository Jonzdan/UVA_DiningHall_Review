import { DiningHallsEnum, RunkModel } from "../../models/index.js";
import {
    RunkDataParser,
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

const url = "https://virginia.campusdish.com/en/locationsandmenus/runk/";
export const runkRouter = Router();
const parser = new RunkDataParser(axios, RunkModel, url);

runkRouter.get("/", async (_req, res) => {
    try {
        const initialData = await findCurrentFoodData(
            DiningHallsEnum.Runk,
            parser.getDiningHallTimeFrame(new Date().getDay(), getCurHour()),
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

runkRouter.post(
    "/",
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput),
    async (req, res) => {
        try {
            await updateFoodSettings(
                DiningHallsEnum.Runk,
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
