import { Component, type OnInit } from '@angular/core';
import { AccountService } from '../../services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    public title = 'HooRank';
    public showIconMenu: boolean;

    constructor(
        private accountService: AccountService,
    ) {
        this.showIconMenu = false;
    }

    async ngOnInit(): Promise<void> {
        await this.accountService.initializeSession()
            .catch((error) => console.error("Session init failed", error));
    }

    toggleMenu() {
        this.showIconMenu = !this.showIconMenu;
    }
}
