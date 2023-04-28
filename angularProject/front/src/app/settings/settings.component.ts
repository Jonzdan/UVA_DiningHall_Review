import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NavSideBarService } from '../nav-side-bar.service';
import { AccountService } from '../account.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  private saveChanges:string = "Save Changes"; private discardChanges:string = "Discard Changes";
  private _currentSelected:string = "Password"
  private notificationString:string = "Select the kinds of notifications you get about your activities and recommendations"
  checked:boolean = false;

  constructor(private navbar:NavSideBarService, private acc:AccountService, private cd:ChangeDetectorRef) {

  }

  ngOnInit():void {
    this.acc.pullAccountDetails() //wont get called since authConfirm request hasn't finished yet
  }

  get settingsList() { return this.acc.accountInfo}
  get currentSelected() { return this._currentSelected}
  set currentSelected(s:string) {
    this.acc.convertPropertyToView(s);
  }

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
      default: 
        return ""
    }
  }

  whichTitleSubstring(s:string) {
    switch (s) {
      case "Notification": {
       return "Select the kinds of notifications you get about your activities and recommendations"
      }
      case "Password": {
        return "View Password Details and Options"
      }
      default: //add more obvs
        return
    }
  }

  ngOnDestroy():void {
    
  }

  switchContent(e:any) {
    this._currentSelected = this.convertSideBarViewToProp(e.target.textContent)
    console.log(this._currentSelected === this.convertSideBarViewToProp('Password'))
    //switch content, meaning add functionality/variables to hold info and use conditionals to display conditionally...
  }

  updateChanges(e:any) {
    let html = e.target.textContent
    if (html === this.saveChanges) {
      this.acc.updateAccountSettings()
    }
    else if (html === this.discardChanges) {
      
      //revert every slider to what it was before in child components
      const data = this.acc.accountInfo[this.acc.convertViewToProperty(this._currentSelected)]
      if (data === undefined) throw console.error(data);
      const targets = this.acc.clickedOnTargets
      for (const target of targets) {
        target.target.checked = data?.[target.prop] //this works
        //target.target.nextElementSibling.className = this.slider
        //target.target.dispatchEvent(new Event('change'))
        

      }

      this.acc.resetSettingsToDefault()
    }
    this.acc.pendingChanges = false;
  }

  onCheckedChange(e:any) {

  }

  get pendingChanges() { return this.acc.pendingChanges}
}
