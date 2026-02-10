import { Component, Input } from '@angular/core';
import { AccountService } from '../../services';
import { DiningHallsEnum } from 'hoorank-shared';

@Component({
  selector: 'app-settings-tab-profile',
  templateUrl: './settings-tab-profile.component.html',
  styleUrls: ['./settings-tab-profile.component.css']
})
export class SettingsTabProfileComponent {
    @Input() title!: string;
    @Input() description!: string;

    constructor(private accountService: AccountService) {

    }

    get username() {
        return this.accountService.accountDetails.username || '';
    }

    get diningHalls() {
        return DiningHallsEnum;
    }
}
