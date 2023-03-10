import { Component, OnInit, Input, AfterViewInit, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AccountService } from '../account.service';
import { filter, map, tap } from 'rxjs'

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
  hideNavBar:boolean = false

  private _appearanceColor:string = "Default"

  constructor(private elementRef: ElementRef, private as: AccountService, private router: Router) { }

  @HostListener('document:click', ['$event'])
    onClick(event: any) {
      if (!this.dropDown) {
        return
      }
      let e = event.target
      let i = 0
      while (e?.id != "dropdown_container" && i < 5) {
        e = e?.parentNode
        i++
      }
      if (event.target?.nodeName !== "circle" && e?.nodeName !== "LI" && e?.id != "dropdown_container" && this.dropDown) {
        this.dropDown = false
      }
    }

  ngOnInit(): void {
    this.router.events
    .pipe(
      map((event:any)=> {
        if (!(event instanceof NavigationEnd)) {
          return
        }
        switch (event.url) {
          case "/login": {
            this.hideNavBar = true
            break
          }
          case "/register": {
            this.hideNavBar = true;
            break
          }
          default: {
            this.hideNavBar = false
          }
        }
      })
    ).subscribe(res => {
      
    })

  }

  ngAfterViewInit(): void {

    
  }

  get appearanceColor() { return this._appearanceColor }
  set appearanceColor(str:string) { 
    if (str !== "Default" && str !== "Dark") return
    this._appearanceColor = str
  }

  showAccountOptions(e:any) {
    this.dropDown = !this.dropDown
    /* if (!this.as.signedIn) { //not available currently bypass
      return
    } */
    //else show options *dropdown*
    
  }

  signOut(e:any) {
    if (!this.as.signedIn) return
    this.as.signOut()
  }

  get accountText() { return this.as.accountText }
  get signedIn() { return this.as.signedIn }



  
}
