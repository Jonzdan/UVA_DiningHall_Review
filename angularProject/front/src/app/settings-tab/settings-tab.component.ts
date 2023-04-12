import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css']
})
export class SettingsTabComponent implements OnInit {

  @Input() identifier!: any;
  

  constructor() { }

  ngOnInit(): void {
  }

}
