import { Component } from '@angular/core';
import { AccountService, AppService, NavSideBarService } from '../../services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'HooRank';

    constructor(
        private appService: AppService,
        private as: AccountService,
        private navbar: NavSideBarService,
    ) {}

    ngOnInit() {
        this.appService.setData();
        this.as.authBeginning();
    }

    get showIconMenu() {
        return this.navbar.showIconMenu;
    }
    get marginShift() {
        return this.navbar.marginShift;
    }
}
