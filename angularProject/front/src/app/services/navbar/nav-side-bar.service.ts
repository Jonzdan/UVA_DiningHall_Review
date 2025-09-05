import { Injectable } from '@angular/core';
import { NavigationEnd } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class NavSideBarService {
    constructor() {}
    private _hideNavBar = false;
    private _navBarToIcon = false;
    private _showIconMenu = false;
    private _parentDecrease = false;
    private _appearanceColor = 'Default';
    private _dropDown = false;
    public marginShift = '250px';

    get parentDecrease() {
        return this._parentDecrease;
    }
    get hideNavBar() {
        return this._hideNavBar;
    }
    get navBarToIcon() {
        return this._navBarToIcon;
    }
    get showIconMenu() {
        return this._showIconMenu;
    }
    get appearanceColor() {
        return this._appearanceColor;
    }
    get dropDown() {
        return this._dropDown;
    }

    updateNavBarToIcon(windowWidth: number) {
        if (windowWidth < 0) return;
        if (windowWidth <= 480) {
            this._navBarToIcon = true;
        } else {
            this._navBarToIcon = false;
        }
    }

    hideNavbar(boolean: boolean, event: NavigationEnd) {
        if (!(event instanceof NavigationEnd)) return;
        this._hideNavBar = boolean;
    }

    set appearanceColor(str: string) {
        if (!(typeof str !== 'string')) return;
        if (str !== 'Default' || str !== 'Dark') return;
        this._appearanceColor = str;
    }

    set dropDown(bol: boolean) {
        if (typeof bol !== 'boolean') return;
        this._dropDown = !this._dropDown;
    }

    flipSideBar(e: any) {
        this._showIconMenu = !this._showIconMenu;
    }

    navigateSoCloseSideBar() {
        this._showIconMenu = false;
    }
}
