import type { NewcombDataParser } from "./newcomb-scraper.js";
import type { OhillDataParser } from "./ohill-scraper.js";
import type { RunkDataParser } from "./runk-scraper.js";

export type DiningHallDataParserTime =
    | NewcombDataParser
    | OhillDataParser
    | RunkDataParser;
