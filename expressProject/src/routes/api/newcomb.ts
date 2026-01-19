import { Router } from "express";
import {
    DiningHallsEnum,
    StationFoodItemSchemaInput,
    SUBROUTES,
} from "hoorank-shared";

import { axios, NewcombDataParser } from "../../services/index.js";
import { mongoSanitizerMiddleware } from "../../utils.js";
import { csrf, validateBody } from "../utils.js";
import { addFoodItem, getFoodData } from "./utils.js";

const url =
    "https://virginia.campusdish.com/LocationsAndMenus/FreshFoodCompany";
export const newcombRouter = Router();
const parser = new NewcombDataParser(axios, url);

newcombRouter.get(SUBROUTES.API.NEWCOMB, async (_req, res) => {
    await getFoodData(parser, res, DiningHallsEnum.Newcomb);
});

newcombRouter.post(
    SUBROUTES.API.NEWCOMB,
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput),
    async (req, res) => {
        await addFoodItem(parser, res, req.body);
    },
);
