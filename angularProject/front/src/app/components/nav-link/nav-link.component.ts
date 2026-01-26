import { Component, Input } from '@angular/core';
import { AccountService } from 'src/app/services';

// TODO: potential integration into rest of structure
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
