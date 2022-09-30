import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-station-name',
  templateUrl: './station-name.component.html',
  styleUrls: ['./station-name.component.css']
})
export class StationNameComponent implements OnInit {

  @Input() headers = new Set<string>()
  @Input() short!: string
  shopToItems: any = {}
  @Input() data!: any

  constructor() { }

  ngOnInit(): void {
    //create each stationName id\
    //here we will create each shop after organizing items to each other
    for (const elem of this.headers.values()) {
      if (!(elem in this.shopToItems)) {
        this.shopToItems[elem] = []
      }
    }

      for (const key in this.data) {
        if (this.data[key].stationName in this.shopToItems) {
          this.shopToItems[this.data[key].stationName].push(this.data[key].item)
        }
      }
    }
    
    
  

  ngAfterViewInit(): void {
  }

  

}
