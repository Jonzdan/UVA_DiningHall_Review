import { getCurHour, RunkDataParser } from 'src/services/scraper';
import { Router } from 'express';
import { DiningHallsEnum, RunkModel } from 'src/models';
import { csrf, validateBody } from '../../services/validation/auth';
import { axios } from 'src/services/scraper';
import { HttpStatusCode } from 'axios';
import { findCurrentFoodData, updateFoodSettings } from 'src/services';
import { StationFoodItemSchemaInput } from '@shared/api';
import { mongoSanitizerMiddleware } from 'src/utils';

const url = 'https://virginia.campusdish.com/en/locationsandmenus/runk/';
export const runkRouter = Router();
const parser = new RunkDataParser(axios, RunkModel, url);

runkRouter.get('/', async (_req, res) => {
    try {
        const initialData = await findCurrentFoodData(DiningHallsEnum.Runk, parser.getDiningHallTimeFrame(new Date().getDay(), getCurHour()));
        
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
    }
    catch (err) {
        console.error(err);
        res.status(HttpStatusCode.InternalServerError).json({
            msg: err instanceof Error ? err.message : ''
        });
    }
});

runkRouter.post('/', csrf, mongoSanitizer, validateBody(StationFoodItemSchemaInput), async (req, res) => {
    try {
        await updateFoodSettings(DiningHallsEnum.Runk, req.body, parser.getDiningHallTimeFrame(new Date().getDay(), getCurHour()));
        res.status(HttpStatusCode.NoContent).end();
    }
    catch (err) {
        console.error(err);
        res.status(HttpStatusCode.InternalServerError).json({
            msg: err instanceof Error ? err.message : ''
        });
    }
});
