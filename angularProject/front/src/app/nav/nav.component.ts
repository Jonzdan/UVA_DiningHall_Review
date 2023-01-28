import { Component, OnInit, Input, AfterViewInit, ElementRef, Output, EventEmitter} from '@angular/core';

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

    
  }


  
}
