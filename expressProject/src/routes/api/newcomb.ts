import { DiningHallsEnum, NewcombModel } from "../../models/index.js";
import {
    NewcombDataParser,
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
    "https://virginia.campusdish.com/LocationsAndMenus/FreshFoodCompany";
export const newcombRouter = Router();
const parser = new NewcombDataParser(axios, NewcombModel, url);

newcombRouter.get("/", async (_req, res) => {
    try {
        const timeFrame = parser.getDiningHallTimeFrame(
            new Date().getDay(),
            getCurHour(),
        );
        const initialData = await findCurrentFoodData(
            DiningHallsEnum.Newcomb,
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

newcombRouter.post(
    "/",
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput),
    async (req, res) => {
        try {
            await updateFoodSettings(
                DiningHallsEnum.Newcomb,
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
