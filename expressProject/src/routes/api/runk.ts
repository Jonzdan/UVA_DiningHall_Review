import { Router } from "express";
import {
    DiningHallsEnum,
    StationFoodItemFields,
    StationFoodItemSchemaInput,
    SUBROUTES,
} from "hoorank-shared";

import { axios, RunkDataParser } from "../../services/index.js";
import { mongoSanitizerMiddleware } from "../../utils.js";
import { csrf, validateBody } from "../utils.js";
import { addFoodItem, getFoodData } from "./utils.js";
import { HttpStatusCode } from "axios";

const url = "https://virginia.campusdish.com/en/locationsandmenus/runk/";
export const runkRouter = Router();
const parser = new RunkDataParser(axios, url);

runkRouter.get(SUBROUTES.API.RUNK, async (_req, res) => {
    const data = await parser.getData();
    res.status(HttpStatusCode.Ok).json(data);
    return;
    await getFoodData(parser, res, DiningHallsEnum.Runk);
});

runkRouter.post(
    SUBROUTES.API.RUNK,
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput, StationFoodItemFields),
    async (req, res) => {
        await addFoodItem(parser, res, req.body);
    },
);
