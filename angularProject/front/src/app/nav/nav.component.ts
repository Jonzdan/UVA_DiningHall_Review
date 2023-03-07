import { Component, OnInit, Input, AfterViewInit, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})


  


export class NavComponent implements OnInit {

  


  dropDown:boolean = false
  private id:any  = {
    "Observatory Hill Dining Hall": "ohill",
    "Runk Dining Hall": "runk",
    "Newcomb Dining Hall": "newcomb"
  }

  constructor(private elementRef: ElementRef, private as: AccountService) { }

  @HostListener('document:click', ['$event.target'])
    onClick(event: HTMLLIElement) {
      if (event.tagName !== "circle" && this.dropDown) {
        this.dropDown = false
      }
    }
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    
  }

  showAccountOptions(e:any) {
    this.dropDown = !this.dropDown
    /* if (!this.as.signedIn) { //not available currently bypass
      return
    } */
    //else show options *dropdown*
    
  }

  get accountText() { return this.as.accountText }
  get signedIn() { return this.as.signedIn }



  
}
