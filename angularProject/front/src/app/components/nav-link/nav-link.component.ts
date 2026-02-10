import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services';

@Component({
  selector: 'app-nav-link',
  templateUrl: './nav-link.component.html',
  styleUrls: ['./nav-link.component.css']
})
export class NavLinkComponent {
    @Input() label!: string;
    @Input() routerLink!: string | any[];
    @Input() iconSvg?: string;
    @Input() mobileOnly = false;
    @Input() desktopOnly = false;
    
    constructor(private accountService: AccountService) {}

    get isSignedIn() {
        return this.accountService.accountDetails.isSignedIn;
    }
}
