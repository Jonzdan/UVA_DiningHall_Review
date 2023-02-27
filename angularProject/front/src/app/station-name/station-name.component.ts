import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-station-name',
  templateUrl: './station-name.component.html',
  styleUrls: ['./station-name.component.css']
})
export class StationNameComponent implements OnInit {

  @Input() head!: string
  @Input() short!: string
  hideStation:boolean = false
  shopToItems: any = {}
  flipArrow: boolean = false

  constructor(private appService: AppService) { }

  ngOnInit(): void {
    this.shopToItems = this.appService.getShopToItem(this.short)
  }
    
    
  hideStationFunc(e:any) {
    this.hideStation = !this.hideStation;
  }

  ngAfterViewInit(): void {
  }

  

}
