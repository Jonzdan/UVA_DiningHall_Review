import { Component, OnInit, Input} from '@angular/core';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css']
})
export class ToggleComponent implements OnInit {

  @Input() option:any 
  @Input() identifier!:string
  @Input() check!:boolean
  name!:string; subtext!:string

  constructor(private acc:AccountService) { }

  ngOnInit(): void {
    const obj:{[index:string]:any} = this.acc.convertIdentifierToActualPropNames(this.option, this.identifier)
    this.name = obj['name']; this.subtext = obj['subtext']
    console.log(this.name, this.subtext)
  }

  ngAfterViewInit():void {
  }

  updateToggle(e:any) {
    //update obj in accountService
    
    if (e.target?.checked === undefined) return
    let key:string = e.target.nextElementSibling.nextElementSibling.children[0].textContent //h3;
    key.trim()
    const value:boolean = e.target.checked; //also edit later
    this.acc.addTempSettingStore(this.acc.convertViewToProperty(this.identifier), this.acc.convertViewIntoNotificationProp(key) , value)
    this.acc.addToTargetsArray(e, this.acc.convertViewIntoNotificationProp(key))
  }

  convertIdentifierToActualPropNames(o:{[index:string]:any}, i:string) {
    return this.acc.convertIdentifierToActualPropNames(o, i);
  }

}
