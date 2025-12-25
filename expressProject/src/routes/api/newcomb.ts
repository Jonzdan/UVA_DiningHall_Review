import {
    DiningHallsEnum,
    ROUTES,
    StationFoodItemSchemaInput,
} from "hoorank-shared";
import {
    NewcombDataParser,
    axios,
    findCurrentFoodData,
    getCurHour,
    updateFoodSettings,
} from "../../services/index.js";
import { csrf, validateBody } from "../../validations/index.js";
import { HttpStatusCode } from "axios";
import { Router } from "express";
import { mongoSanitizerMiddleware } from "../../utils.js";

const url =
    "https://virginia.campusdish.com/LocationsAndMenus/FreshFoodCompany";
export const newcombRouter = Router();
const parser = new NewcombDataParser(axios, url);

newcombRouter.get(ROUTES.API.NEWCOMB, async (_req, res) => {
    try {
        const initialData = await findCurrentFoodData(
            DiningHallsEnum.Newcomb,
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

newcombRouter.post(
    ROUTES.API.NEWCOMB,
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
