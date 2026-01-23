import { Router } from "express";
import {
    DiningHallsEnum,
    StationFoodItemFields,
    StationFoodItemSchemaInput,
    SUBROUTES,
} from "hoorank-shared";

import { axios, OhillDataParser } from "../../services/index.js";
import { mongoSanitizerMiddleware } from "../../utils.js";
import { csrf, validateBody } from "../utils.js";
import { addFoodItem, getFoodData } from "./utils.js";

const url =
    "https://virginia.campusdish.com/LocationsAndMenus/ObservatoryHillDiningRoom";
export const ohillRouter = Router();
const parser = new OhillDataParser(axios, url);

ohillRouter.get(SUBROUTES.API.OHILL, async (_req, res): Promise<void> => {
    await getFoodData(parser, res, DiningHallsEnum.Ohill);
});

ohillRouter.post(
    SUBROUTES.API.OHILL,
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput, StationFoodItemFields),
    async (req, res) => {
        await addFoodItem(parser, res, req.body);
    },
);
