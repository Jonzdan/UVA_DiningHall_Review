import { Component, OnInit, Input, AfterViewInit, ElementRef, Output, EventEmitter} from '@angular/core';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {


  private id:any  = {
    "Observatory Hill Dining Hall": "ohill",
    "Runk Dining Hall": "runk",
    "Newcomb Dining Hall": "newcomb"
  }

  constructor(private elementRef: ElementRef, private as: AccountService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    
  }

  showAccountOptions(e:any) {
    if (!this.as.signedIn) { //not available
      return
    }
    //else show options *dropdown*
    
  }

  get accountText() { return this.as.accountText }
  get signedIn() { return this.as.signedIn }



  
}
