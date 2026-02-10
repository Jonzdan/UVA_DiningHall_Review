export const ExpandSectionEnum = {
    ARROW_DOWN: '↓',
    ARROW_UP: '↑',
} as const;

export type ExpandSection = typeof ExpandSectionEnum[keyof typeof ExpandSectionEnum];
