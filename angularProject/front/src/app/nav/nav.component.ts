import { Component, OnInit, Input, AfterViewInit, ElementRef, Output, EventEmitter, HostListener, Host} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AccountService } from '../account.service';
import { filter, map, tap } from 'rxjs'
import { NavSideBarService } from '../nav-side-bar.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})

export class NavComponent implements OnInit {


  constructor(private navbar: NavSideBarService, private as: AccountService, private router: Router) { }

  @HostListener('document:click', ['$event'])
    onClick(event: any) {
      if (!this.navbar.dropDown) {
        return
      }
      let e = event.target
      let i = 0
      while (e?.id != "dropdown_container" && i < 5) {
        e = e?.parentNode
        i++
      }
      if (event.target?.nodeName !== "circle" && e?.nodeName !== "LI" && e?.id != "dropdown_container" && this.dropDown) {
        this.navbar.dropDown = false
      }
    }

  @HostListener('window:resize', []) 
    updateMenu() {
      this.navbar.updateNavBarToIcon(window.innerWidth)
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
            this.navbar.hideNavbar(true, event)
            break
          }
          case "/register": {
            this.navbar.hideNavbar(true, event)
            break
          }
          default: {
            this.navbar.hideNavbar(false, event)
          }
        }
        this.navbar.navigateSoCloseSideBar()
      })
    ).subscribe(res => {
      
    })

    this.navbar.updateNavBarToIcon(window.innerWidth)

  }
  
  ngAfterViewInit(): void {

    
  }

  openSideBar(e:any) {
    this.navbar.flipSideBar(e)
  }

  get appearanceColor() { return this.navbar.appearanceColor }
  set appearanceColor(str:string) { this.navbar.appearanceColor = str }
  get showIconMenu() { return this.navbar.showIconMenu}
  get hideNavBar() { return this.navbar.hideNavBar }
  get navBarToIcon() { return this.navbar.navBarToIcon}
  get dropDown() { return this.navbar.dropDown}


  showAccountOptions(e:any) {
    this.navbar.dropDown = !this.navbar.dropDown
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
