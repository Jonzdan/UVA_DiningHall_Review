import { Component, HostListener, Input, Output, type OnInit, EventEmitter, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, } from '@angular/router';
import { AccountOrchestrationService, AccountService } from '../../services';
import { Observable, Subscription, filter } from 'rxjs';
import { NavStates } from './types';
import { ROUTE_PATHS } from 'src/app/constants';
import { DropDownComponent } from '../drop-down';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, OnDestroy {
    @Input() showIconMenu!: boolean;
    private _subscription: Subscription;
    private navState: NavStates;
    @ViewChild(DropDownComponent, { read: ElementRef })
    dropdownContainer!: ElementRef<HTMLElement>;
    @Output() toggleMenu: EventEmitter<boolean>;

    constructor(
        private accountService: AccountService,
        private accountOrchestrationService: AccountOrchestrationService,
        private router: Router,
    ) {
        this._subscription = new Subscription();
        this.toggleMenu = new EventEmitter();
        this.navState = {
            hideNav: false,
            toggleDropDown: false,
            iconMetadata: {
                showMenu: this.showIconMenu,
                showIcon: false,
            }
        };
    }

    @HostListener('document:click', ['$event'])
    onClick(event: any) {
        if (!this.navState.toggleDropDown) {
            return;
        }
        
        // this.navState.toggleDropDown = !this.dropdownContainer.nativeElement.contains(event.target);
    }

    @HostListener('window:resize', [])
    updateMenu() {
        this.updateNavBarIcon();
    }

    private updateNavBarIcon() {
        this.navState.iconMetadata.showIcon = window.innerWidth <= 480;
    }

    ngOnInit(): void {
        const routerObservable = this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd)
            )
            .subscribe((event => {
                this.navState.hideNav = [`/${ROUTE_PATHS.LOGIN}`, `/${ROUTE_PATHS.REGISTER}`, `/${ROUTE_PATHS.SETTINGS}`].some((value) => event.url.includes(value));
                this.navState.iconMetadata.showMenu = false;
            }));

        this._subscription.add(routerObservable);
        this.updateNavBarIcon();
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    openSideBar(): void {
        this.navState.iconMetadata.showMenu = true;
        this.toggleMenu.next(true);
    }

    closeSideBar() {
        this.navState.iconMetadata.showMenu = false;
        this.toggleMenu.next(false);
        console.log(this.navState)
    }

    async signOut() {
        if (!this.accountService.isSignedIn) {
            return;
        }
        await this.accountService.logout();
    }

    toggleDropDown(value: boolean): void {
        this.navState.toggleDropDown = value;
    }

    get isSignedIn$() {
        return this.accountService.isSignedIn$;
    }

    get isDropDownToggled() {
        return this.navState.toggleDropDown;
    }

    get isNavBarIcon() {
        return this.navState.iconMetadata.showIcon;
    }

    get isNavBarHidden() {
        return this.navState.hideNav;
    }

    get showMenu() {
        return this.navState.iconMetadata.showMenu;
    }

    get accountText(): string {
        return this.accountService.accountDetails.displayText;
    }

    get signedIn(): boolean {
        return this.accountService.accountDetails.isSignedIn;
    }
}
