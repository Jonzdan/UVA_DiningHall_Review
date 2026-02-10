import { CurrentSelectedSettingTab, ToggleSettingsKeys } from "src/app/services/settings";

export interface Metadata {
    readonly title: string;
    readonly description: string;
} 

export type SettingsTabToMetadata = Record<CurrentSelectedSettingTab, Metadata>;
export type NotificationMetadata = Partial<Record<ToggleSettingsKeys, Metadata>>;
