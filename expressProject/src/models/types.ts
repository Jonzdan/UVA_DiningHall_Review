export const OhillTimeFrameEnum = [
    "Brunch (8am-2:15pm)",
    "Breakfast (7am-11am)",
    "Lunch (11am-2:15pm)",
    "Afternoon Snack (2:15pm-5pm)",
    "Dinner (5pm-8pm)",
    "Unavailable",
] as const;

export type OhillTimeFrame = (typeof OhillTimeFrameEnum)[number];

export const RunkTimeFrameEnum = [
    "Brunch",
    "Dinner",
    "Breakfast",
    "Lunch",
    "Late Night",
    "Unavailable",
] as const;

export type RunkTimeFrame = (typeof RunkTimeFrameEnum)[number];

export const NewcombHallTimeFrameEnum = [
    "Closed",
    "Unavailable",
    "Brunch (10am-2pm)",
    "Breakfast (7am-10:30am)",
    "Lunch (11am-2pm)",
    "Afternoon Snack (2pm-5pm)",
    "Dinner (5pm-8pm)",
] as const;

export const GlobalTimeFrames = [
    ...OhillTimeFrameEnum,
    ...RunkTimeFrameEnum,
    ...NewcombHallTimeFrameEnum,
] as const;

export type NewcombDiningHallTimeFrame =
    (typeof NewcombHallTimeFrameEnum)[number];
export type TimeFrameEnumTypes =
    | typeof NewcombHallTimeFrameEnum
    | typeof OhillTimeFrameEnum
    | typeof RunkTimeFrameEnum;
export type TimeFrameTypes =
    | NewcombDiningHallTimeFrame
    | OhillTimeFrame
    | RunkTimeFrame;
