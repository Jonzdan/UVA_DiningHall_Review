import { Router } from "express";
import { ROUTES, StationFoodItemSchemaInput } from "hoorank-shared";

import { axios, OhillDataParser } from "../../services/index.js";
import { mongoSanitizerMiddleware } from "../../utils.js";
import { csrf, validateBody } from "../utils.js";
import { addFoodItem, getFoodData } from "./utils.js";

const url =
    "https://virginia.campusdish.com/LocationsAndMenus/ObservatoryHillDiningRoom";
export const ohillRouter = Router();
const parser = new OhillDataParser(axios, url);

ohillRouter.get(ROUTES.API.OHILL, async (_req, res): Promise<void> => {
    await getFoodData(parser, res);
});

ohillRouter.post(
    ROUTES.API.OHILL,
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput),
    async (req, res) => {
        await addFoodItem(parser, res, req.body);
    },
);
