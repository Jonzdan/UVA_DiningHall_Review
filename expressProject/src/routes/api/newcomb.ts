import {
    ROUTES,
    StationFoodItemSchemaInput,
} from "hoorank-shared";
import {
    NewcombDataParser,
    axios
} from "../../services/index.js";
import { csrf, validateBody } from "../utils.js";
import { Router } from "express";
import { mongoSanitizerMiddleware } from "../../utils.js";
import { addFoodItem, getFoodData } from "./utils.js";

const url =
    "https://virginia.campusdish.com/LocationsAndMenus/FreshFoodCompany";
export const newcombRouter = Router();
const parser = new NewcombDataParser(axios, url);

newcombRouter.get(ROUTES.API.NEWCOMB, async (_req, res) => {
    await getFoodData(parser, res);
});

newcombRouter.post(
    ROUTES.API.NEWCOMB,
    csrf,
    mongoSanitizerMiddleware,
    validateBody(StationFoodItemSchemaInput),
    async (req, res) => {
        await addFoodItem(parser, res, req.body);
    },
);
