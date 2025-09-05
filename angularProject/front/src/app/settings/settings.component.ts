import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NavSideBarService } from '../nav-side-bar.service';
import { AccountService } from '../account.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  private saveChanges:string = "Save Changes"; private discardChanges:string = "Discard Changes";
  private _currentSelected:string = "Profile"
  private notificationString:string = "Select the kinds of notifications you get about your activities and recommendations"
  checked:boolean = false;

  constructor(private navbar:NavSideBarService, private acc:AccountService, private router:Router) {

  }

  ngOnInit():void {
    this.acc.pullAccountDetails() //wont get called since authConfirm request hasn't finished yet
  }

  get settingsList() { return this.acc.accountInfo}
  get currentSelected() { return this.acc.currentSelected}

  convertPropertyToView(s:string) {
    return this.acc.convertPropertyToView(s)
  }

  convertSideBarViewToProp(s:string) {
    s.trim()
    switch(s) {
      case "Notifications":
        return "Notification"
      case "Password":
          return "Password"
      case "Profile": {
        return "Profile"
      }
      case "Logout": {
        return s
      }
      default: 
        return ""
    }
  }

  returnToHome(e:any) { // By Logout
    this.acc.resetSettingsToDefault()
    this.router.navigateByUrl("/");
  }

  whichTitleSubstring(s:string) {
    switch (s) {
      case "Notification": {
       return "Select the kinds of notifications you get about your activities and recommendations"
      }
      case "Password": {
        return "View Password Details and Options"
      }
      case "Profile": {
        return "View Profile Details and Security"
      }
      default: //add more obvs
        return
    }
  }

  ngOnDestroy():void {
    
  }

  switchContent(e:any) {
    this.acc.currentSelected = this.convertSideBarViewToProp(e.target.textContent)
  }

  onCheckedChange(e:any) {

  }

  get pendingChanges() { return this.acc.pendingChanges}
}
