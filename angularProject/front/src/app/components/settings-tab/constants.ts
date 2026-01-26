import { SettingTabTypes, profileText, notificationsEmailText, passwordText } from "src/app/services";
import { SettingsTabToMetadata, NotificationMetadata } from "./types";

export const TabToTitleAndSubtext: SettingsTabToMetadata = {
    [SettingTabTypes.PROFILE]: {
        title: '',
        description: profileText,
    } as const,
    [SettingTabTypes.NOTIFICATIONS]: {
        title: '',
        description: notificationsEmailText,
    } as const,
    [SettingTabTypes.PASSWORD]: {
        title: '',
        description: passwordText
    } as const
} as const;

export const NotificationTitleAndSubtext: NotificationMetadata = {
    "notifications.foodOptInBol": {
        title: 'Food Alerts',
        description: 'Opt in to receive general food communications and updates'
    },
    "notifications.newcombOptIn": {
        title: 'Newcomb Alerts',
        description: 'Opt in to receive food communications about Newcomb Dining Hall'
    },
    "notifications.ohillOptIn": {
        title: 'Ohill Alerts',
        description: 'Opt in to receive food communications about Observatory Hill Dining Hall'
    },
    "notifications.replyToPost": {
        title: 'Post Alerts',
        description: 'Opt in to receive news communications about replies to your posts'
    },
    "notifications.runkOptIn": {
        title: 'Runk Alerts',
        description: 'Opt in to receive food communications about Runk Hill Dining Hall'
    },
} as const;
