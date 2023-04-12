import { Component, OnDestroy } from '@angular/core';
import { NavSideBarService } from '../nav-side-bar.service';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  private _notificationsList:Array<any> = new Array();
  constructor(private navbar:NavSideBarService, private acc:AccountService) {

  }

  ngOnInit():void {
    this.notificationsList.push("notifications")
    this.acc.pullAccountDetails()
  }

  get notificationsList() { return this._notificationsList}

  ngOnDestroy():void {
    
  }
}
