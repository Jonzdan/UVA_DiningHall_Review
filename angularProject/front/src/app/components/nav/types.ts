export interface NavIconState {
    showIcon: boolean;
    showMenu: boolean;
}

export interface NavStates {
    hideNav: boolean;
    toggleDropDown: boolean;
    readonly iconMetadata: NavIconState;
}

export type AppearanceColor = 'Default' | 'Dark';
