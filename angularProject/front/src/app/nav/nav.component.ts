import { Component, OnInit, Input, AfterViewInit, ElementRef} from '@angular/core';

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

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.addEventListener("click", this.showMenu)
    
  }

  //just use ngIf with a boolean to hide certain parts of variables.
  showMenu(e:any) {
    console.log(e.target)
    let menu:string = e.target.textContent
    const thing = document.querySelector(`#${this.id[menu]}`)
    //change styles to show;
  }
}
