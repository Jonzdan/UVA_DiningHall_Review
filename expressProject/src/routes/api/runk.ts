import { Router } from "express";
import { ROUTES, StationFoodItemSchemaInput } from "hoorank-shared";

import { axios, RunkDataParser } from "../../services/index.js";
import { mongoSanitizerMiddleware } from "../../utils.js";
import { csrf, validateBody } from "../utils.js";
import { addFoodItem, getFoodData } from "./utils.js";

const url = "https://virginia.campusdish.com/en/locationsandmenus/runk/";
export const runkRouter = Router();
const parser = new RunkDataParser(axios, url);

runkRouter.get(ROUTES.API.RUNK, async (_req, res) => {
    await getFoodData(parser, res);
});

runkRouter.post(
    ROUTES.API.RUNK,
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput),
    async (req, res) => {
        await addFoodItem(parser, res, req.body);
    },
);
