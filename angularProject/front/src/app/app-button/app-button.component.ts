import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './app-button.component.html',
  styleUrls: ['./app-button.component.css']
})
export class AppButtonComponent implements OnInit {

  @Input() name!: string
  @Input() selected!: boolean
  constructor() { }

  ngOnInit(): void {
    
  }

}
